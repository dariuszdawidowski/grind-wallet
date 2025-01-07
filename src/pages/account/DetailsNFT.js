import { Component } from '/src/utils/Component.js';
import { Button, ButtIcon, ButtLink } from '/src/widgets/Button.js';
import { loadImage } from '/src/utils/ImageCache.js';
import { SheetAccountSendNFT } from '/src/pages/account/SendNFT.js';
import { SheetAccountReceiveNFT } from '/src/pages/account/ReceiveNFT.js';

export class SheetNFTDetails extends Component {

    constructor(args) {
        super(args);

        // NFT canister actor reference
        this.actor = null;

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = args.wallet;

        // NFT info
        this.nft = args.nft;

        // Build
        this.element.classList.add('form');

        // Buttons
        const buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);
        this.widget.button = {
            send: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-up-bold.svg">',
                text: 'Send',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: this.wallet.name,
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
                        title: this.wallet.name,
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

        // Show in the dashboard
        this.append(new Button({
            text: 'Show in ICP Dashboard',
            click: () => {
                chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/canister/${this.nft.collection}` });
            }
        }));

        // Separator
        const sep = document.createElement('hr');
        sep.style.marginTop = '20px';
        this.element.append(sep);

        // Remove
        this.append(new ButtLink({
            text: `Remove this NFT from the list`,
            click: () => {
                if (confirm('Delete this NFT?\nIt will only be removed from this list not from the blockchain - you can always add it again.')) {
                    delete this.app.user.wallets[this.wallet.public].nfts[`${this.nft.collection}:${this.nft.id}`];
                    this.app.save('wallets', this.app.user.wallets);
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        }));

    }

    async update() {
        this.actor = await this.app.cache.get(`nft:${this.nft.collection}`);
    }

}

