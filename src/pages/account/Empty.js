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
            <img src="assets/icon728.png" class="biglogo" style="margin-bottom: 40px;">
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
                const newAccount = new SheetNewAccount(args);
                this.app.card.show({
                    title: 'Create new account',
                    content: newAccount.element
                });
            }
        }));
        this.append(new Button({
            app: args.app,
            id: 'import-account',
            text: 'Import account',
            click: () => {
                const importAccount = new SheetImportAccount(args);
                this.app.card.show({
                    title: 'Import existing account',
                    content: importAccount.element
                });
            }
        }));

    }

}
