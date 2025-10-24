/**
 * Page: User Registration - Create Password
 */

import { Component } from '/src/utils/component.js';
import { isPasswordStrong, generateSalt, hashPassword } from '/src/utils/password.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { InputPassword } from '/src/chrome-extension/popup/widgets/input.js';
const { version } = require('/package.json');

export class PageRegisterPassword extends Component {

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
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 20px;"></div>
            <h2>
                Please create a password
            </h2>
            <p style="text-align: center; margin-top: 0px;">
                It is specific to this particular extension<br>
                not related to the blockchain.
            </p>
        `;

        // Inputs
        const password = new InputPassword({
            app: args.app,
            id: 'new-password-first',
            placeholder: 'Create password',
            focus: true
        });
        const passwordConfirm = new InputPassword({
            app: args.app,
            id: 'new-password-confirm',
            placeholder: 'Confirm password'
        });
        this.append(password);
        this.append(passwordConfirm);

        // Buttons
        this.append(new Button({
            app: args.app,
            id: 'new-password-ok',
            text: 'Confirm',
            click: () => {
                const newPassword = password.get();
                if (newPassword === passwordConfirm.get()) {
                    if (isPasswordStrong(newPassword)) {
                        generateSalt().then(salt => {
                            hashPassword(newPassword, salt).then(hashed => {
                                chrome.storage.local.set({ salt: salt, password: hashed }, () => {
                                    // Store password
                                    this.app.user.password = newPassword;
                                    // Save session
                                    chrome.storage.session.set({ active: true, password: newPassword });
                                    // Activate main page
                                    this.app.page('accounts');
                                });
                            });
                        });
                    }
                    else {
                        alert('Password is not strong enough. Please ensure it is at least 8 characters long and includes a mix of uppercase and lowercase letters, numbers, and special characters.');
                    }

                }
                else {
                    alert('Passwords do not match. Please try again.');
                }
            }
        }));

    }

}
