/**
 * First page: Accept terms of use
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { Checkbox } from '/src/chrome-extension/popup/widgets/checkbox.js';
const { version } = require('/package.json');

export class PageAcceptTerms extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 0;">
                Welcome to Grind Wallet <span>v${version}</span>
            </h1>
            <p style="text-align: center;">
                for the Internet Computer blockchain (ICP)
            </p>
            <p style="text-align: center; margin-top:0; margin-bottom: 32px; color: #ffe36c;">
                This is an alpha version. Use with caution.
            </p>
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 100px;"></div>
            <p style="text-align: center;">
                Before you continue, please familiarize yourself<br>with our <a href="https://www.grindwallet.com/en/security/" target="_blank">Security</a> and <a href="https://www.grindwallet.com/en/privacy/" target="_blank">Privacy</a> guidelines.
            </p>
        `;

        // H2
        const h2 = document.createElement('h2');
        this.element.append(h2);

        // Terms and conditions checkbox
        const agree = new Checkbox({
            app: args.app,
            id: 'terms-check',
            text: `I agree to Grind Wallet's <a href="https://www.grindwallet.com/en/terms-of-use/" target="_blank">Terms of use</a>`,
            click: (checked) => {
                if (checked) confirm.enable();
                else confirm.disable();
            }
        });
        h2.append(agree.element);

        // Buttons
        const confirm = new Button({
            app: args.app,
            id: 'terms-ok',
            text: 'Confirm',
            disabled: true,
            click: () => {
                if (agree.checked()) {
                    chrome.storage.local.set({ terms: true }, () => {
                        this.app.page('register-password');
                    });
                }
            }
        });
        this.append(confirm);

    }

}
