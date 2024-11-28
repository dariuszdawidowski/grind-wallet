import { Component } from '/src/utils/Component.js';
import { formatCurrency, formatE8S } from '/src/utils/Currency.js';
import { icpLedgerBalance } from '/src/blockchain/InternetComputer/Ledger.js';


export class Coin extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Canister ID
        this.canisterId = args.canisterId;

        // Class
        this.element.classList.add('coin-badge');

        // Coin shape
        this.coin = document.createElement('div');
        this.coin.classList.add('coin');
        this.coin.innerText = 'Ratex';
        this.element.append(this.coin);

        // Label
        this.label = document.createElement('div');
        this.label.classList.add('label');
        this.label.innerHTML = '...<br>RTX';
        this.element.append(this.label);

        // Events
        if ('click' in args) this.element.addEventListener('click', args.click);

        // Fetch balance
        icpLedgerBalance(this.wallet.tokens[this.canisterId].actor, this.wallet.principal).then(balance => {
            this.wallet.tokens[this.canisterId].balance = balance;
            this.label.innerHTML = `${formatCurrency(formatE8S(balance))}<br>RTX`;
        });
    }

}
