import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';
import { SheetNewAccount } from './New.js';
import { SheetImportAccount } from './Import.js';


export class PageEmpty extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center;">Welcome to Grind Wallet<br><img src="assets/icon728.png" width="155"></h1>
            <h2>
                <img src="assets/material-design-icons/wallet.svg">
                <br>
                You don't have any wallet,<br>
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
