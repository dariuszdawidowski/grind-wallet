import { Component } from '../../Boost.js';
import { formatE8S } from '../../utils/Currency.js';
import { Button, ButtIcon, ButtLink } from '../../widgets/Button.js';
import { SheetAccountSend } from './Send.js';
import { SheetAccountReceive } from './Receive.js';


export class SheetAccountDetails extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h1 style="margin-top: 0;">
               ${this.wallet.balance !== null ? formatE8S(this.wallet.balance) + ' ICP' : 'Fetching...'}
            </h1>
        `;
        const buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);

        // Buttons
        this.buttons = {
            send: new ButtIcon({
                app: args.app,
                id: 'use-account-send',
                icon: '<img src="assets/material-design-icons/arrow-up-bold.svg">',
                text: 'Send',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: this.wallet.name,
                        component: new SheetAccountSend(args)
                    });
                }
            }),
            receive: new ButtIcon({
                app: args.app,
                id: 'use-account-receive',
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: this.wallet.name,
                        component: new SheetAccountReceive(args)
                    });
                }
            }),
            swap: new ButtIcon({
                app: args.app,
                id: 'use-account-swap',
                icon: '<img src="assets/material-design-icons/swap-horizontal-bold.svg">',
                text: 'Swap',
                click: () => {
                    chrome.tabs.create({ url: 'https://app.icpswap.com' });
                }
            }),
            fiat: new ButtIcon({
                app: args.app,
                id: 'use-account-fiat',
                icon: '<img src="assets/material-design-icons/currency-usd.svg">',
                text: 'Fiat',
                click: () => {
                    chrome.tabs.create({ url: 'https://www.coinbase.com' });
                }
            })
        };

        Object.values(this.buttons).forEach(button => {
            buttonbar.append(button.element);
        });

        this.append(new Button({
            app: args.app,
            id: 'use-account-dashboard',
            text: 'Show in ICP Dashboard',
            click: () => {
                chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/account/${this.wallet.account}` });
            }
        }));

        // Remove
        this.append(new ButtLink({
            app: args.app,
            id: 'use-account-delete',
            text: 'Remove this account from the list',
            click: () => {
                if (confirm('Delete this account?')) {
                    chrome.storage.local.set({ 'wallets': {} });
                }
            }
        }));

    }

}

