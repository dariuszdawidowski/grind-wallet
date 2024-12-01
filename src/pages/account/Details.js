import { Component } from '/src/utils/Component.js';
import { icpt2ICP } from '/src/utils/Currency.js';
import { Button, ButtIcon, ButtLink } from '/src/widgets/Button.js';
import { AddPlus } from '/src/widgets/Add.js';
import { SheetAccountSend } from './Send.js';
import { SheetAccountReceive } from './Receive.js';
import { SheetAddCustomToken } from './Token.js';


export class SheetAccountDetails extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Canister ID
        this.canisterId = args.canisterId;
console.log('TI', this.wallet.tokens[this.canisterId])

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h1 style="margin-top: 0;">
               ${this.wallet.tokens[this.canisterId].balance !== null ? icpt2ICP(this.wallet.tokens[this.canisterId].balance, this.wallet.tokens[this.canisterId].decimals) + ' ' + this.wallet.tokens[this.canisterId].symbol : 'Fetching...'}
            </h1>
        `;
        const buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);

        // Buttons
        this.buttons = {
            send: new ButtIcon({
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
                icon: '<img src="assets/material-design-icons/swap-horizontal-bold.svg">',
                text: 'Swap',
                click: () => {
                    chrome.tabs.create({ url: `https://app.icpswap.com/swap?input=${this.canisterId}&output=ryjl3-tyaaa-aaaaa-aaaba-cai` });
                }
            }),
            fiat: new ButtIcon({
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

        // Show in the dashboard
        this.append(new Button({
            text: 'Show in ICP Dashboard',
            click: () => {
                chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/account/${this.wallet.account}` });
            }
        }));

        // Add custom token
        if (this.canisterId == this.app.ICP_LEDGER_CANISTER_ID) {
            this.append(new AddPlus({
                text: 'Add custom token',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: 'Add custom token',
                        component: new SheetAddCustomToken({app: args.app, wallet: this.wallet})
                    });
                }
            }));
        }

        // Remove
        this.append(new ButtLink({
            text: `Remove this ${(this.canisterId == this.app.ICP_LEDGER_CANISTER_ID) ? 'account' : 'token'} from the list`,
            click: () => {

                // ICP
                if (this.canisterId == this.app.ICP_LEDGER_CANISTER_ID) {
                    if (confirm('Delete this account?\nIt will only be removed from this list not from the blockchain - you can always recover it from the phrase.')) {
                        delete this.app.user.wallets[this.wallet.public]
                        this.app.save('wallets', this.app.user.wallets);
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                }

                // Token
                else {
                    if (confirm('Delete this token?\nIt will only be removed from this list not from the blockchain - you can always add it again.')) {
                        delete this.app.user.wallets[this.wallet.public].tokens[this.canisterId];
                        this.app.save('wallets', this.app.user.wallets);
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                }
            }
        }));

    }

}

