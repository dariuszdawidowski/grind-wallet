import { Component } from '/src/utils/Component.js';
import { formatWithSpaces, icpt2ICP } from '/src/utils/Currency.js';


export class Card extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('card');
        this.element.innerHTML = `
            <div class="name">${this.wallet.name}</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="currency">ICP</div>
            <div class="amount">Fetching...</div>
            <div class="account1">${formatWithSpaces(this.wallet.account.substring(0, 24), 4)}</div>
            <div class="account2">${formatWithSpaces(this.wallet.account.substring(24), 4)}</div>
            <img class="logo" src="${this.wallet.crypto == 'ICP' ? 'assets/IC_logo_horizontal.svg' : ''}">
            <div class="open">
                Click to open
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="7" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                    <rect x="7" y="3" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                </svg>
            </div>
        `;

        // Events
        if ('click' in args) this.element.addEventListener('click', args.click);

        // Fetch balance
        this.wallet.tokens[this.app.ICP_LEDGER_CANISTER_ID].request.balance().then(balance => {
            this.wallet.tokens[this.app.ICP_LEDGER_CANISTER_ID].balance = balance;
            this.element.querySelector('.amount').innerHTML = icpt2ICP(balance);
        });

    }

}
