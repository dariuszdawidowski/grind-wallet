import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';
import { SheetNewAccount } from './New.js';
import { SheetImportAccount } from './Import.js';
const { version } = require('../../../package.json');


export class PageEmpty extends Component {

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
                <img src="assets/material-design-icons/wallet.svg">
                <br>
                You don't have any wallet account,<br>
                create a new one or import an existing one<br>
                from the recovery pharse.
            </h2>
        `;

        // Buttons
        this.append(new Button({
            app: args.app,
            id: 'create-account',
            text: 'Create account',
            click: () => {
                this.app.sheet.append({
                    title: 'Create new account',
                    component: new SheetNewAccount(args)
                });
            }
        }));
        this.append(new Button({
            app: args.app,
            id: 'import-account',
            text: 'Import account',
            click: () => {
                this.app.sheet.append({
                    title: 'Import existing account',
                    component: new SheetImportAccount(args)
                });
            }
        }));

    }

}
