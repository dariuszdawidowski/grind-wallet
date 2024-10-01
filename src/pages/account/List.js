import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';
import { Card } from '../../widgets/Card.js';
import { SheetNewAccount } from './NewAccount.js';
import { SheetImportAccount } from './ImportAccount.js';


export class PageListAccounts extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center;">Grind Wallet</h1>
        `;

        // Cards
        this.append(new Card({
            app,
            id: 'account-card-XXXXX',
            click: () => {
            }
        }));

        // Buttons
        this.append(new Button({
            app,
            id: 'create-account',
            text: 'Create account',
            click: () => {
                const newAccount = new SheetNewAccount(app);
                app.card.show({
                    title: 'Create new account',
                    content: newAccount.element
                });
            }
        }));
        this.append(new Button({
            app,
            id: 'import-account',
            text: 'Import account',
            click: () => {
                const importAccount = new SheetImportAccount(app);
                app.card.show({
                    title: 'Import existing account',
                    content: importAccount.element
                });
            }
        }));

    }

}
