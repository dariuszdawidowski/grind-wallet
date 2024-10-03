import { Component } from '../../Boost.js';
import { formatCurrency } from '../../utils/Currency.js';
import { Button, Butticon } from '../../widgets/Button.js';
import { SheetSendAccount } from './Send.js';
import { SheetReceiveAccount } from './Receive.js';


export class SheetShowAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h1 style="margin-top: 0;">
               ${args.balance !== null ? formatCurrency(args.balance, 8) + ' ICP' : 'Fetching...'}
            </h1>
        `;
        const buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);

        // Buttons
        this.buttons = {
            send: new Butticon({
                app: args.app,
                id: 'use-account-send',
                icon: '<img src="assets/material-design-icons/arrow-up-bold.svg">',
                text: 'Send',
                click: () => {
                    const sendTokens = new SheetSendAccount(args);
                    this.app.card.show({
                        title: args.name,
                        content: sendTokens.element
                    });
                }
            }),
            receive: new Butticon({
                app: args.app,
                id: 'use-account-receive',
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
                    const receiveTokens = new SheetReceiveAccount(args);
                    this.app.card.show({
                        title: args.name,
                        content: receiveTokens.element
                    });
                }
            }),
            swap: new Butticon({
                app: args.app,
                id: 'use-account-swap',
                icon: '<img src="assets/material-design-icons/swap-horizontal-bold.svg">',
                text: 'Swap',
                click: () => {
                    chrome.tabs.create({ url: 'https://app.icpswap.com' });
                }
            }),
            fiat: new Butticon({
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
                chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/account/${args.account}` });
            }
        }));

        // Remove
        const remove = document.createElement('div');
        remove.classList.add('softbutton');
        remove.innerHTML = 'Remove this account from the list →';
        this.element.append(remove);

    }

}

