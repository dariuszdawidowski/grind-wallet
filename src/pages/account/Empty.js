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
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="white" stroke-width="3">
                    <rect x="5" y="15" width="40" height="25" rx="3" ry="3" fill="none" stroke="white" stroke-width="3"/>
                    <rect x="5" y="10" width="35" height="10" fill="none" stroke="white" stroke-width="3"/>
                    <circle cx="38" cy="25" r="2" fill="white" />
                  </svg>
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
