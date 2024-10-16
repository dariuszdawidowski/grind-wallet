import { Component } from '../../Boost.js';
import { verifyPassword } from '../../utils/Password.js';
import { Form } from '../../widgets/Form.js';
import { Button } from '../../widgets/Button.js';
import { InputPassword } from '../../widgets/Input.js';
const { version } = require('../../../package.json');


export class PageLogin extends Component {

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
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 120px;"></div>
            <h2>
                Please enter your password
            </h2>
        `;

        // Form
        const form = new Form({
            app: args.app,
            id: 'login-form',
        });
        this.append(form);

        // Inputs
        const password = new InputPassword({
            app: args.app,
            id: 'enter-password',
            placeholder: 'Password',
            focus: true
        });
        form.append(password);

        // Buttons
        const button = new Button({
            app: args.app,
            id: 'end-password-ok',
            text: 'Unlock',
            enter: false,
            click: () => {
                this.verify(password.get(), args.salt, args.hash);
                password.set('');
            }
        });
        form.append(button);

    }

    verify(password, salt, hash) {
        verifyPassword(password, salt, hash).then((valid) => {
            if (valid) {
                // Store password
                this.app.user.password = password;
                // Save session
                chrome.storage.session.set({ active: true, password: this.app.user.password });
                // Load and decode wallets
                chrome.storage.local.get(['wallets'], (store) => {

                    if (store.wallets && Object.keys(store.wallets).length) {
                        this.app.load('wallets', store.wallets);
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
                alert('Incorrect password. Please try again.');
            }
        });
    }

}
