import { Component } from '/src/utils/Component.js';
import { registerBiometric } from '/src/utils/Biometric.js';
import { Button, ButtLink } from '/src/widgets/Button.js';
const { version } = require('/package.json');


export class PageRegisterWebAuthn extends Component {

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
            <h2 style="margin-top: 64px">
                Please select an authentication method
            </h2>
            <p style="text-align: center; margin-top: 0px;">
                It is specific to this particular extension<br>
                not related to the blockchain
            </p>
        `;

        // Button: Biometric
        this.append(new Button({
            app: args.app,
            id: 'auth-method-webauthn',
            text: 'Create biometric access',
            click: () => {
                registerBiometric().then(() => {
                    console.log('Registered');
                });
            }
        }));

        // Button: Password
        this.append(new ButtLink({
            app: args.app,
            id: 'auth-method-password',
            text: 'No, I prefer to create an oldschool password',
            click: () => {
                this.app.page('register-password');
            }
        }));

    }

}
