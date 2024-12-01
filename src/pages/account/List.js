import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { Card } from '/src/widgets/Card.js';
import { Coin } from '/src/widgets/Coin.js';
import { SheetNewAccount } from './New.js';
import { SheetImportAccount } from './Import.js';
import { SheetAccountDetails } from './Details.js';
const { version } = require('/package.json');


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

        // Accounts
        Object.values(this.app.user.wallets).forEach(wallet => {

            if ('rebuilded' in wallet) {

                // Native token as credit card
                this.append(new Card({
                    app: args.app,
                    wallet,
                    click: () => {
                        this.app.sheet.append({
                            title: wallet.name,
                            component: new SheetAccountDetails({app: args.app, wallet, canisterId: this.app.ICP_LEDGER_CANISTER_ID})
                        });
                    }
                }));

                const coins = document.createElement('div');
                coins.classList.add('coins');
                this.element.append(coins);

                // Custom tokens as coins
                Object.entries(wallet.tokens).forEach(([id, token]) => {
                    if (id != this.app.ICP_LEDGER_CANISTER_ID) {
                        const coin = new Coin({
                            canisterId: id,
                            wallet,
                            click: () => {
                                this.app.sheet.append({
                                    title: wallet.name,
                                    component: new SheetAccountDetails({app: args.app, wallet, canisterId: id})
                                });
                            }
                        });
                        coins.append(coin.element);
                    }
                });

                // Separator
                this.element.append(document.createElement('hr'));

            }
            
        });

        // Info
        const info = document.createElement('div');
        info.style.margin = '17px auto 7px auto';
        info.innerHTML = 'Create next one or import an existing one';
        this.element.append(info);

        // Buttons
        const createButton = new Button({
            text: 'Create account',
            click: () => {
                this.app.sheet.append({
                    title: 'Create new account',
                    component: new SheetNewAccount(args)
                });
            }
        });
        this.append(createButton);

        const importButton = new Button({
            text: 'Import account',
            click: () => {
                this.app.sheet.append({
                    title: 'Import existing account',
                    component: new SheetImportAccount(args)
                });
            }
        });
        importButton.element.style.marginBottom = '30px';
        this.append(importButton);

    }

}
