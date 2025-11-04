/**
 * Exchange sheet
 */

import { Component } from '/src/utils/component.js';
import { TokenBox } from '/src/chrome-extension/popup/widgets/token-box.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';

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
        h3.innerText = 'Currently only one pair available (BTC->ckBTC)';
        this.element.append(h3);

        // Token box (from)
        this.tokenFrom = new TokenBox({
            selected: 'btc'
        });
        this.append(this.tokenFrom);

        // Separator arrow
        const arrow = document.createElement('div');
        arrow.classList.add('exchange-arrow');
        this.element.append(arrow);
        const arrowContent = document.createElement('div');
        arrowContent.classList.add('arrow-content');
        arrowContent.style.backgroundImage = `url('assets/material-design-icons/arrow-down-bold.svg')`;
        arrow.append(arrowContent);

        // Token box (to)
        this.tokenTo = new TokenBox({
            selected: 'ckbtc'
        });
        this.append(this.tokenTo);

        // Exchange button
        const buttonExchange = new Button({
            text: 'Mint Chain-key token',
            click: () => {
            }
        });
        buttonExchange.element.style.margin = '18px auto';
        this.append(buttonExchange);

        // Description
        this.append(new ButtonDescription({
            app: this.app,
            text: `Read more about Chain-key technology <a href="https://internetcomputer.org/chainfusion" target="_blank">HERE</a>`
        }));
        

    }

}
