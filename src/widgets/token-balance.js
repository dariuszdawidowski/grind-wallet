import { TokenImage } from './token-image.js';
import { formatCurrency, icpt2ICP } from '/src/utils/Currency.js';

export class TokenBalance extends TokenImage {

    constructor(args) {
        super(args);

        // Label
        this.label = document.createElement('div');
        this.label.classList.add('label');
        this.label.innerHTML = `${this.wallet.tokens[this.canisterId].symbol}<br>...`;
        this.element.append(this.label);

        // Click (with distance preventing scroll)
        this.click = {
            x: 0,
            y: 0,
            distance: function(x2, y2) {
                const dx = x2 - this.x;
                const dy = y2 - this.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
        };
        if ('click' in args) {
            this.element.addEventListener('mousedown', (event) => {
                this.click.x = event.x;
                this.click.y = event.y;
            });
            this.element.addEventListener('mouseup', (event) => {
                if (this.click.distance(event.x, event.y) <= 10) args.click();
            });
        }

        // Fetch balance
        this.wallet.tokens[this.canisterId].request.balance().then(balance => {
            this.wallet.tokens[this.canisterId].balance = balance;
            this.label.innerHTML = `${this.wallet.tokens[this.canisterId].symbol}<br>${formatCurrency(icpt2ICP(balance, this.wallet.tokens[this.canisterId].decimals), 4)}`;
        });

    }

}
