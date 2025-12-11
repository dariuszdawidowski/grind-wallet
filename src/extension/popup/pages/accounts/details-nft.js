/**
 * NFT details sheet
 */

import { browser } from '/src/utils/browser.js';
import { Component } from '/src/utils/component.js';
import { ButtIcon, ButtLink } from '/src/extension/popup/widgets/button.js';
import { NFTImage } from '/src/extension/popup/widgets/nft-image.js';
import { SheetAccountSendNFT } from '/src/extension/popup/pages/accounts/send-nft.js';
import { SheetAccountReceiveNFT } from '/src/extension/popup/pages/accounts/receive-nft.js';
import { Copy } from '/src/extension/popup/widgets/copy.js';

export class SheetNFTDetails extends Component {

    constructor({ app, wallet, nft }) {
        super({ app });

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = wallet;

        // NFT info {collection, id, standard, thumbnail} 
        this.nft = nft;

        // Build
        this.element.classList.add('form');

        // Image
        this.image = new NFTImage({
            app: this.app,
            classList: ['nft'],
            canisterId: this.nft.collection,
            nftId: this.nft.id
        });
        this.append(this.image);
        this.image.element.addEventListener('click', () => {
            this.nft.service.experience({ token: this.nft.id }).then(url => {
                browser.tabs.create({ url });
            });
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

        // Canister ID copy icon
        const canisterCopy = new Copy({ buffer: this.nft.collection });
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

        // Token ID copy icon
        const tokenCopy = new Copy({ buffer: this.nft.id });
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
                    this.app.sheet.append({
                        title: `Send NFT from ${this.wallet.name}`,
                        component: new SheetAccountSendNFT({ app, wallet, nft })
                    });
                }
            }),
            receive: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
                    this.app.sheet.append({
                        title: `Receive NFT to ${this.wallet.name}`,
                        component: new SheetAccountReceiveNFT({ app, wallet, nft })
                    });
                }
            }),
            sell: new ButtIcon({
                icon: '<img src="assets/material-design-icons/store.svg">',
                text: 'Sell',
                click: () => {
                    browser.tabs.create({ url: `https://dgdg.app` });
                }
            }),
            buy: new ButtIcon({
                id: 'button-bar-buy-icon',
                icon: '<img src="assets/material-design-icons/cart.svg">',
                text: 'Buy',
                click: () => {
                    browser.tabs.create({ url: `https://dgdg.app` });
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
                browser.tabs.create({ url: `https://dashboard.internetcomputer.org/canister/${this.nft.collection}` });
            }
        }));

        // Remove
        this.append(new ButtLink({
            text: `Remove this NFT from the list`,
            icon: 'assets/material-design-icons/delete.svg',
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
        if (!this.app.isOffline()) this.nft.cache().then(() => {
            this.nft.service.amIOwner({ token: this.nft.id }).then(own => {
                if (own === false) {
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
        this.app.wallets.get(this.wallet.public).nfts.del(`${this.nft.collection}:${this.nft.id}`);
        // Log transaction
        const datetime = new Date();
        this.app.log.add(this.wallet.principal, `${this.nft.collection}:${datetime.getTime()}`, {
            datetime: datetime.toISOString(),
            type: 'del.nft',
            nft: {
                canister: this.nft.collection,
                id: this.nft.id
            }
        });
        // Save wallets
        this.app.wallets.save();
    }

}
