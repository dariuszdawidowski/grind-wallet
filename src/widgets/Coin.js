import { Component } from '/src/utils/Component.js';
import { formatCurrency, formatE8S } from '/src/utils/Currency.js';


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
        this.coin.innerText = this.wallet.tokens[this.canisterId].name;
        this.element.append(this.coin);

        // Label
        this.label = document.createElement('div');
        this.label.classList.add('label');
        this.label.innerHTML = `...<br>${this.wallet.tokens[this.canisterId].symbol}`;
        this.element.append(this.label);

        // Events
        if ('click' in args) this.element.addEventListener('click', args.click);

        // Fetch balance
        this.wallet.tokens[this.canisterId].request.balance().then(balance => {
            this.wallet.tokens[this.canisterId].balance = balance;
            this.label.innerHTML = `${formatE8S(balance)}<br>${this.wallet.tokens[this.canisterId].symbol}`;
        });
    }

}
