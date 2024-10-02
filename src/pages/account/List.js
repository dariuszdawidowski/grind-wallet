import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';
import { Card } from '../../widgets/Card.js';
import { SheetNewAccount } from './NewAccount.js';
import { SheetImportAccount } from './ImportAccount.js';
const { version } = require('../../../package.json');


export class PageListAccounts extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 25px;">Grind Wallet <span>v${version}</span></h1>
        `;

        // Cards
        this.append(new Card({
            app: args.app,
            id: 'account-aa39b30e61dd2b181a5f2df050d3f0de1ca8811ac7a352a3af97b0ffb29f423a',
            name: 'ICP #1',
            balance: 0.0,
            account: 'aa39b30e61dd2b181a5f2df050d3f0de1ca8811ac7a352a3af97b0ffb29f423a',
            logo: 'assets/IC_logo_horizontal.svg',
            click: () => {
            }
        }));

        // Separator
        this.element.append(document.createElement('hr'));

        // Info
        const info = document.createElement('div');
        info.style.margin = '17px auto 7px auto';
        info.innerHTML = 'Create next one or import an existing one';
        this.element.append(info);

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
