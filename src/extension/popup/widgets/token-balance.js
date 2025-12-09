/**
 * Token balance widget
 */

import { Component } from '/src/utils/component.js';
import { TokenImage } from './token-image.js';
import { formatCurrency, icpt2ICP } from '/src/utils/currency.js';

export class TokenBalance extends Component {

    constructor(args) {
        super(args);

        // Token
        const token = args.wallet.tokens.get(args.canisterId);

        // Class
        this.element.id = `balance_${args.wallet.principal}_${token.symbol}`;
        this.element.classList.add('token-balance');

        // Token image
        const coin = new TokenImage({
            app: args.app,
            canisterId: args.canisterId,
            symbol: token.symbol
        });
        this.append(coin);

        // Label
        const label = document.createElement('div');
        label.classList.add('label');
        this.element.append(label);

        // Symbol
        const symbol = document.createElement('div');
        symbol.classList.add('symbol');
        symbol.innerText = token.symbol;
        label.append(symbol);

        // Amount
        this.amount = document.createElement('div');
        this.amount.classList.add('amount');
        this.amount.innerText = '...';
        label.append(this.amount);

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
        if (token.ready) {
            token.balance().then(balance => {
                if (balance) this.amount.innerText = formatCurrency(icpt2ICP(balance, token.decimals), 4);
                else this.amount.innerText = '?';
            });
        }

    }

}
