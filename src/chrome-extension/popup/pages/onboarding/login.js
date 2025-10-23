import { Component } from '/src/utils/component.js';
import { verifyPassword } from '/src/utils/password.js';
import { Form } from '/src/chrome-extension/popup/widgets/form.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { InputPassword } from '/src/chrome-extension/popup/widgets/input.js';
const { version } = require('/package.json');


export class PageLogin extends Component {

    constructor(args) {
        super(args);

        // UI controls widgets
        this.widget = {};

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
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 120px;"></div>
            <h2>
                Please enter your password
            </h2>
        `;

        // Form
        const form = new Form();
        this.append(form);

        // Inputs
        this.widget.password = new InputPassword({
            placeholder: 'Password',
            focus: true
        });
        form.append(this.widget.password);

        // Buttons
        this.widget.button = new Button({
            text: 'Unlock',
            enter: false,
            click: () => {
                this.verify(this.widget.password.get(), args.salt, args.hash);
                this.widget.password.set('');
                this.widget.password.input.placeholder = 'Password sent';
                this.widget.button.disable();
            }
        });
        form.append(this.widget.button);

    }

    verify(password, salt, hash) {
        verifyPassword(password, salt, hash).then((valid) => {
            if (valid) {
                this.widget.button.set('Logging in...');
                // Store password
                this.app.user.password = password;
                // Save session
                chrome.storage.session.set({ active: true, password: this.app.user.password });
                // Load and decode wallets
                chrome.storage.local.get(['wallets', 'version'], (store) => {

                    if (store.wallets && Object.keys(store.wallets).length) {
                        this.app.load('wallets', store.wallets, store.version);
                        this.app.create('wallets').then(() => {
                            // Show accounts list
                            this.app.page('accounts');
                        });
                    }

                    // Empty accounts page
                    else {
                        this.app.page('accounts');
                    }

                });
            }
            else {
                this.widget.password.set('');
                this.widget.password.input.placeholder = 'Password';
                this.widget.button.enable();
                alert('Incorrect password. Please try again.');
            }
        });
    }

}
