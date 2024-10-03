import { Component } from '../../Boost.js';
import { verifyPassword } from '../../utils/Password.js';
import { Button } from '../../widgets/Button.js';
import { InputPassword } from '../../widgets/Input.js';
const { version } = require('../../../package.json');


export class EnterPassword extends Component {

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
            <img src="assets/icon728.png" class="biglogo" style="margin-bottom: 120px;">
            <h2>
                Please enter your password
            </h2>
        `;

        // Inputs
        const password = new InputPassword({
            app: args.app,
            id: 'enter-password',
            placeholder: 'Password'
        });
        this.append(password);

        // Buttons
        this.append(new Button({
            app: args.app,
            id: 'end-password-ok',
            text: 'Unlock',
            click: () => {
                verifyPassword(password.get(), args.salt, args.hash).then(valid => {
                    if (valid) {
                        console.log('PWD OK');
                    }
                    else {
                        alert('Incorrect password. Please try again.');
                    }
                });
            }
        }));

        // Focus
        password.focus();

    }

}
