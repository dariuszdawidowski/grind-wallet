import { Component } from '../../Boost.js';
import { isPasswordStrong } from '../../Utils.js';
import { Button } from '../../widgets/Button.js';
import { InputPassword } from '../../widgets/Input.js';


export class NewPassword extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center;">
                Welcome to Grind Wallet<br>
                <img src="assets/icon728.png" width="155">
            </h1>
            <h2>
                Welcome! To get started,<br>
                please create a password for your account.
            </h2>
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
