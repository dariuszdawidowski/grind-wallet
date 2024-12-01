import { Component } from '/src/utils/Component.js';
import { formatCurrency, icpt2ICP } from '/src/utils/Currency.js';
import { loadImage } from '/src/utils/ImageCache.js';


export class Coin extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Token Canister ID
        this.canisterId = args.canisterId;

        // Class
        this.element.classList.add('coin-badge');

        // Coin shape
        this.coin = document.createElement('div');
        this.coin.classList.add('coin');
        this.element.append(this.coin);

        // Label
        this.label = document.createElement('div');
        this.label.classList.add('label');
        this.label.innerHTML = `${this.wallet.tokens[this.canisterId].symbol}<br>...`;
        this.element.append(this.label);

        // Events
        if ('click' in args) this.element.addEventListener('click', args.click);

        // Fetch balance
        this.wallet.tokens[this.canisterId].request.balance().then(balance => {
            this.wallet.tokens[this.canisterId].balance = balance;
            this.label.innerHTML = `${this.wallet.tokens[this.canisterId].symbol}<br>${formatCurrency(icpt2ICP(balance))}`;
        });

        // Load cached image
        (async () => {
            try {
                const image = await loadImage(`token:${this.canisterId}`);
                this.coin.style.backgroundColor = 'transparent';
                this.coin.style.backgroundImage = `url('${image}')`;
            }

            // Fallback text
            catch(error) {
                this.coin.innerText = this.wallet.tokens[this.canisterId].symbol;
            }
        })();

    }

}
