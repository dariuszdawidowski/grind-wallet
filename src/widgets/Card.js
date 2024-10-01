import { Component } from '../Boost.js';
import { Button } from './Button.js';


export class Card extends Component {

    constructor(args) {
        super(args.app);

        // Build
        this.element.id = args.id;
        this.element.classList.add('card');
        this.element.innerHTML = `
            <div class="name">${args.name}</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="currency">ICP</div>
            <div class="amount">${args.balance !== null ? this.formatCurrency(args.balance, 8) : 'Fetching...'}</div>
            <div class="account1">${this.formatWithSpaces(args.account.substring(0, 24), 4)}</div>
            <div class="account2">${this.formatWithSpaces(args.account.substring(24), 4)}</div>
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
        this.sheet = new SheetCardAccount(args.app);

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

    formatCurrency(value, fixed = 2) {
        const s = value.toFixed(fixed).toString()
        const [whole, fractional] = s.split('.');
        return this.formatWithSpaces(whole, 3, false) + '.' + fractional;
    }

    formatWithSpaces(inputString, everyNCharacters, fromLeft = true) {
        let result = '';

        if (fromLeft) {
            for (let i = 0; i < inputString.length; i++) {
                result += inputString[i];

                if ((i + 1) % everyNCharacters === 0 && i !== inputString.length - 1) {
                    result += ' ';
                }
            }
        } else {
            for (let i = inputString.length - 1, j = 1; i >= 0; i--, j++) {
                result = inputString[i] + result;

                if (j % everyNCharacters === 0 && i !== 0) {
                    result = ' ' + result;
                }
            }
        }

        return result;
    }

}

class SheetCardAccount extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
               An account
            </h3>
        `;

        // Buttons
        this.append(new Button({
            app,
            id: 'create-account-proceed',
            text: 'Proceed',
            click: () => {
            }
        }));

    }

}

