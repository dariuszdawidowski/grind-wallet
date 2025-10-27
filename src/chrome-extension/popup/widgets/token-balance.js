import { Component } from '/src/utils/component.js';
import { TokenImage } from './token-image.js';
import { formatCurrency, icpt2ICP } from '/src/utils/currency.js';

export class TokenBalance extends Component {

    constructor(args) {
        super(args);

        // Class
        this.element.classList.add('token-balance');

        // Token image
        const coin = new TokenImage({
            app: args.app,
            canisterId: args.canisterId,
            wallet: args.wallet,
        });
        this.append(coin);

        // Label
        this.label = document.createElement('div');
        this.label.classList.add('label');
        this.label.innerHTML = `${args.wallet.tokens.get(args.canisterId).symbol}<br>...`;
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
        const token = args.wallet.tokens.get(args.canisterId);
        if (token.ready) {
            token.balance().then(balance => {
                this.label.innerHTML = `${token.symbol}<br>${formatCurrency(icpt2ICP(balance, token.decimals), 4)}`;
            });
        }

    }

}
