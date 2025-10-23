import { Component } from '/src/utils/component.js';
import { Button, ButtIcon, ButtLink } from '/src/chrome-extension/popup/widgets/button.js';
import { loadImage } from '/src/utils/image-cache.js';
import { SheetAccountSendNFT } from '/src/chrome-extension/popup/pages/accounts/send-nft.js';
import { SheetAccountReceiveNFT } from '/src/chrome-extension/popup/pages/accounts/receive-nft.js';
import { Copy } from '/src/chrome-extension/popup/widgets/copy.js';

export class SheetNFTDetails extends Component {

    constructor(args) {
        super(args);

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = args.wallet;

        // NFT info {collection, id, standard, thumbnail} 
        this.nft = args.nft;

        // Build
        this.element.classList.add('form');

        // Image
        this.image = document.createElement('div');
        this.image.classList.add('nft');
        this.element.append(this.image);
        (async () => {
            try {
                const thumbnail = await loadImage(this.nft.thumbnail);
                this.image.innerHTML = thumbnail;
            }
            catch(error) {}
        })();
        this.image.addEventListener('click', () => {
            const page = `https://${this.nft.collection}.raw.ic0.app/?tokenid=${this.nft.id}`;
            chrome.tabs.create({ url: page });
        });

        // Canister ID
        const canisterTitle = document.createElement('h2');
        canisterTitle.style.marginTop = '1.5em';
        canisterTitle.style.marginBottom = '0.5em';
        canisterTitle.style.fontWeight = 'bold';
        canisterTitle.innerText = 'Collection canister ID';
        this.element.append(canisterTitle);
        const canisterElement = document.createElement('div');
        canisterElement.classList.add('line');
        canisterElement.innerText = this.nft.collection;
        this.element.append(canisterElement);

        // Canister ID copy
        const canisterCopy = new Copy({ text: this.nft.collection });
        canisterElement.append(canisterCopy.element);

        // Token ID
        const tokenTitle = document.createElement('h2');
        tokenTitle.style.marginBottom = '0.5em';
        tokenTitle.style.fontWeight = 'bold';
        tokenTitle.innerText = 'NFT token ID';
        this.element.append(tokenTitle);
        const tokenElement = document.createElement('div');
        tokenElement.classList.add('line');
        tokenElement.innerText = this.nft.id;
        this.element.append(tokenElement);

        // Token ID copy
        const tokenCopy = new Copy({ text: this.nft.id });
        tokenElement.append(tokenCopy.element);

        // Buttons
        const buttonbar = document.createElement('div');
        buttonbar.style.marginTop = '20px';
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);
        this.widget.button = {
            send: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-up-bold.svg">',
                text: 'Send',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: `Send NFT from ${this.wallet.name}`,
                        component: new SheetAccountSendNFT(args)
                    });
                }
            }),
            receive: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: `Receive NFT to ${this.wallet.name}`,
                        component: new SheetAccountReceiveNFT(args)
                    });
                }
            }),
            sell: new ButtIcon({
                icon: '<img src="assets/material-design-icons/store.svg">',
                text: 'Sell',
                click: () => {
                    chrome.tabs.create({ url: `https://dgdg.app` });
                }
            }),
            buy: new ButtIcon({
                id: 'button-bar-buy-icon',
                icon: '<img src="assets/material-design-icons/cart.svg">',
                text: 'Buy',
                click: () => {
                    chrome.tabs.create({ url: `https://dgdg.app` });
                }
            }),
        };
        Object.values(this.widget.button).forEach(button => {
            buttonbar.append(button.element);
        });

        // Separator
        const sep = document.createElement('hr');
        sep.style.marginTop = '20px';
        this.element.append(sep);

        // Show in the dashboard
        this.append(new ButtLink({
            text: 'Show NFT candid interface',
            click: () => {
                chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/canister/${this.nft.collection}` });
            }
        }));

        // Remove
        this.append(new ButtLink({
            text: `Remove this NFT from the list`,
            classList: ['end'],
            click: () => {
                if (confirm('Delete this NFT?\nIt will only be removed from this list not from the blockchain - you can always add it again.')) {
                    this.delete();
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        }));

        // Check ownership
        this.nft.cache().then(() => {
            this.nft.service.amIOwner({ token: this.nft.id }).then(own => {
                if (!own) {
                    if (confirm('You are not the owner of this NFT anymore. Do you want to remove it from the list?')) {
                        this.delete();
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                }
            });
        });

    }

    /**
     * Update data
     */

    async update() {
        await this.nft.cache();
    }

    /**
     * Delete NFT from the list
     */

    delete() {
        // Remove from current wallet
        delete this.app.wallets.list[this.wallet.public].nfts[`${this.nft.collection}:${this.nft.id}`];
        // Log transaction
        this.app.log.add({
            type: 'del.nft',
            pid: this.wallet.principal,
            nft: {
                canister: this.nft.collection,
                id: this.nft.id
            }
        });
        // Save wallets
        this.app.saveWallets();
    }

}
