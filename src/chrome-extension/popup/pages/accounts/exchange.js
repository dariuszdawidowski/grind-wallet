/**
 * Exchange sheet
 */

import { Component } from '/src/utils/component.js';
import { TokenBox } from '/src/chrome-extension/popup/widgets/token-box.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';

export class SheetAccountExchange extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');

        // Header
        const h3 = document.createElement('h3');
        h3.style.fontWeight = 'bold';
        h3.innerText = 'Select pair to exchange';
        this.element.append(h3);

        // Token boxes
        this.tokenFrom = new TokenBox({
            app: args.app,
            canisterId: args.canisterId,
            wallet: this.wallet,
            label: 'From'
        });
        this.append(this.tokenFrom);

        this.tokenTo = new TokenBox({
            app: args.app,
            canisterId: args.canisterId,
            wallet: this.wallet,
            label: 'To'
        });
        this.append(this.tokenTo);

        // Exchange button
        const buttonExchange = new Button({
            text: 'Exchange',
            click: () => {
            }
        });
        buttonExchange.element.style.margin = '18px auto';
        this.append(buttonExchange);

    }

}
