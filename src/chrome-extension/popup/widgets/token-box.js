/**
 * Token box for swap
 */

import { Component } from '/src/utils/component.js';
import { InputCurrency } from '/src/chrome-extension/popup/widgets/input.js';
import { formatCurrency } from '/src/utils/currency.js';

export class TokenBox extends Component {

    /**
     * Constructor
     * 
     * selected: string - symbol of preselected token
     * note: string annotation under a value
     * onKeypress: fn - keyboard callback
     */

    constructor(args) {
        super(args);

        // Class
        this.element.classList.add('token-box');

        // Token selector
        this.selector = document.createElement('div');
        this.selector.classList.add('token-select');
        this.element.append(this.selector);

        this.token = this.getTokenInfo({ symbol: args.selected });

        // Token icon image
        const icon = document.createElement('img');
        icon.src = this.token.logo;
        this.selector.append(icon);

        // Token label
        const label = document.createElement('div');
        label.classList.add('token-label');
        label.innerText = this.token.symbol;
        this.element.append(label);

        // Input currency
        this.amount = new InputCurrency({
            placeholder: formatCurrency(0, this.token.decimals),
            note: ('note' in args) ? args.note : null,
            onKeypress: (data) => {
                if ('onKeypress' in args) args.onKeypress(data);
            }
        });
        this.append(this.amount);

    }

    /**
     * Get token symbol
     */

    getSymbol() {
        return (this.token && this.token.symbol ? this.token.symbol.toLowerCase() : '');
    }

    /**
     * Set number value
     */

    setValue(value) {
        this.amount.set(value);
    }

    /**
     * Get token info (TODO: in a future change to global registry fetched and cached from a service canister)
     */

    getTokenInfo({ symbol = null }) {
        if (symbol == 'btc') {
            return { name: 'Bitcoin', symbol: 'BTC', logo: 'assets/tokens/btc.svg', decimals: 8 };
        }
        else if (symbol == 'ckbtc') {
            return { nake: 'ckBTC', symbol: 'ckBTC', logo: 'assets/tokens/ckbtc.svg', decimals: 8 };
        }

        return {};
    }

    /**
     * Make number red
     */

    error(value = true) {
        if (value) this.amount.color('red');
        else this.amount.color();
    }

}
