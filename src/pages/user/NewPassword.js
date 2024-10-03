import { Component } from '../../Boost.js';
import { isPasswordStrong, generateSalt, hashPassword } from '../../utils/Password.js';
import { Button } from '../../widgets/Button.js';
import { InputPassword } from '../../widgets/Input.js';
const { version } = require('../../../package.json');


export class NewPassword extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 0;">
                Welcome to Grind Wallet <span>v${version}</span>
            </h1>
            <p style="text-align: center; margin-bottom: 32px;">
                for the Internet Computer blockchain (ICP)
            </p>
            <img src="assets/icon728.png" class="biglogo" style="margin-bottom: 55px;">
            <h2>
                Please create a password
            </h2>
            <p style="text-align: center; margin-top: 0px;">
                It is specific to this particular extension<br>
                not related to the blockchain
            </p>
        `;

        // Inputs
        const password = new InputPassword({
            app: args.app,
            id: 'new-password-first',
            placeholder: 'Create password'
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
                if (password.get() === passwordConfirm.get()) {
                    if (isPasswordStrong(password.get())) {
                        generateSalt().then(salt => {
                            hashPassword(password.get(), salt).then(hashed => {
                                chrome.storage.local.set({ salt: salt, password: hashed }, () => {
                                    this.app.page('login');
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
