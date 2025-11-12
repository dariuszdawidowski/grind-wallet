import { Component } from '/src/utils/component.js';
import { formatWithSpaces, formatCurrency, icpt2ICP } from '/src/utils/currency.js';

export class Card extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('card');
        this.element.style.backgroundImage = `url('assets/card-ICP-01.png')`;
        this.element.innerHTML = `
            <div class="name">${this.wallet.name}</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="loader light"></div>
            <div class="currency">ICP</div>
            <div id="balance_${this.wallet.principal}_ICP"><div class="amount">Fetching...</div></div>
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
        const token = this.wallet.tokens.get(this.app.ICP_LEDGER_CANISTER_ID);
        token.balance().then(balance => {
            this.element.querySelector('.amount').innerHTML = formatCurrency(icpt2ICP(balance, token.decimals), token.decimals);
            document.body.dispatchEvent(new Event('update.balance'));
            this.showLoader(false);
        });

        // Listen name change
        document.body.addEventListener('update.name', () => {
            this.element.querySelector('.name').innerText = this.wallet.name;
        });

    }

    /**
     * Show/hide loading spinner
     * @param {boolean} show
     */

    showLoader(show = true) {
        this.element.querySelector('.loader').style.display = show ? 'block' : 'none';
    }

}
