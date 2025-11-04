/**
 * Token box for swap
 */

import { Component } from '/src/utils/component.js';
import { InputCurrency } from '/src/chrome-extension/popup/widgets/input.js';
import { formatCurrency } from '/src/utils/currency.js';

export class TokenBox extends Component {

    constructor(args) {
        super(args);

        // Class
        this.element.classList.add('token-box');

        // Token selector
        this.selector = document.createElement('div');
        this.selector.classList.add('token-select');
        this.element.append(this.selector);

        const token = this.getTokenInfo({ symbol: args.selected });

        // Token icon image
        const icon = document.createElement('img');
        icon.src = token.image;
        this.selector.append(icon);

        // Token label
        const label = document.createElement('div');
        label.classList.add('token-label');
        label.innerText = token.symbol;
        this.element.append(label);

        // Input currency
        this.amount = new InputCurrency({
            placeholder: formatCurrency(0, token.decimals),
        });
        this.append(this.amount);

    }

    /**
     * Get token info (TODO: in a future change to global registry fetched and cached from a service canister)
     */

    getTokenInfo({ symbol = null }) {
        if (symbol == 'btc') {
            return { name: 'Bitcoin', symbol: 'BTC', image: 'assets/tokens/btc.svg', decimals: 8 };
        }
        else if (symbol == 'ckbtc') {
            return { nake: 'ckBTC', symbol: 'ckBTC', image: 'assets/tokens/ckbtc.svg', decimals: 8 };
        }

        return {};
    }

}
