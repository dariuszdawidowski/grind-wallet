import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';
import { Card } from '../../widgets/Card.js';
import { SheetNewAccount } from './New.js';
import { SheetImportAccount } from './Import.js';
import { SheetShowAccount } from './Show.js';
import { identityFromPrivate } from '../../utils/Keys.js';
const { version } = require('../../../package.json');


export class PageListAccounts extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('page');
        this.element.innerHTML = `
            <h1 style="text-align: center; margin-bottom: 25px;">
                <img src="assets/icon16.png">
                Grind Wallet <span>v${version}</span>
            </h1>
        `;

        // Accounts like credit cards
        this.app.user.wallets.forEach(wallet => {

            // Recreate identity based on private key
            const info = identityFromPrivate(wallet.private) ;

            // Create card
            const cardArgs = {
                name: wallet.name,
                balance: 0.0,
                identity: info.identity,
                principal: info.principal,
                account: info.account,
                public: wallet.public,
                logo: 'assets/IC_logo_horizontal.svg',
            };
            this.append(new Card({
                app: args.app,
                id: `account-${info.account}`,
                ...cardArgs,
                click: () => {
                    this.app.sheet.append({
                        title: wallet.name,
                        component: new SheetShowAccount({app: args.app, ...cardArgs})
                    });
                }
            }));
            
        });

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
