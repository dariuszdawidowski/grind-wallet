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
            <p style="text-align: center; margin-bottom: 32px;">
                for the Internet Computer blockchain (ICP)
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

        // const form = document.createElement('form');
        // form.addEventListener('submit', (event) => {
        //     event.preventDefault();
        // });
        // this.element.append(form);

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
            enter: true,
            click: () => {
                verifyPassword(password.get(), args.salt, args.hash).then(valid => {
                    if (valid) {
                        // Store password
                        this.app.user.password = password.get();
                        // Save session
                        chrome.storage.session.set({ active: true, password: this.app.user.password });
                        // Accounts page
                        this.app.page('accounts');
                    }
                    else {
                        alert('Incorrect password. Please try again.');
                    }
                });
            }
        });
        form.append(button);

    }

}
