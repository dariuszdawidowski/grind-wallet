import { Component } from '../Boost.js';
import { formatWithSpaces, formatCurrency } from '../Utils.js';
import { Button, Butticon } from './Button.js';


export class Card extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('card');
        this.element.innerHTML = `
            <div class="name">${args.name}</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="currency">ICP</div>
            <div class="amount">${args.balance !== null ? formatCurrency(args.balance, 8) : 'Fetching...'}</div>
            <div class="account1">${formatWithSpaces(args.account.substring(0, 24), 4)}</div>
            <div class="account2">${formatWithSpaces(args.account.substring(24), 4)}</div>
            <img class="logo" src="${args.logo}">
            <div class="open">
                Click to open
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="7" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                    <rect x="7" y="3" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                </svg>
            </div>
        `;

        // Bottom Sheet
        this.sheet = new SheetCardAccount(args);

        // Events
        this.event.on({
            id: `card:${this.element.id}`,
            type: 'click',
            callback: () => {
                this.app.card.show({
                    title: args.name,
                    content: this.sheet.element
                });
            }
        });

    }

}

class SheetCardAccount extends Component {

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
                }
            }),
            receive: new Butticon({
                app: args.app,
                id: 'use-account-receive',
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
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

