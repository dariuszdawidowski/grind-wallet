import { Component } from '../Boost.js';
import { formatWithSpaces, formatCurrency } from '../Utils.js';


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

        // Events
        this.event.on({
            id: `card:${this.element.id}`,
            type: 'click',
            callback: args.click
        });

    }

}
