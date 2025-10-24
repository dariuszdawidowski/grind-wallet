/**
 * Page: List of Accounts
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { SheetNewAccount } from './new.js';
import { SheetImportAccount } from './import.js';
import { Card } from '/src/chrome-extension/popup/widgets/card.js';
const { version } = require('/package.json');

export class PageAccounts extends Component {

    constructor(args) {
        super(args);

        // References
        this.app = args.app;

        // Build
        this.element.classList.add('page');

        // Header
        const header = document.createElement('h1');
        header.style.textAlign = 'center';
        header.style.marginBottom = '25px';
        this.element.append(header);
        const img = document.createElement('img');
        img.src = 'assets/icon16.png';
        header.append(img);
        const title = document.createElement('span');
        title.style.marginLeft = '8px';
        title.innerHTML = `Grind Wallet <span style="font-size: 12px;">v${version}</span>`;
        header.append(title);

        // Main content
        this.content = document.createElement('div');
        this.element.append(this.content);

        // Info
        this.buttonsInfo = document.createElement('div');
        this.buttonsInfo.style.margin = '17px auto 7px auto';
        this.element.append(this.buttonsInfo);

        // Button: Create account
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

        // Button: Import account
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

        // Get wallets and render
        this.app.wallets.load().then(() => {
            // No wallets
            if (this.app.wallets.count() === 0) this.renderNoWallets();
            // Wallets available
            else this.renderWalletsList();
        });

    }

    /**
     * No wallets view
     */

    renderNoWallets() {
        this.content.innerHTML = `
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 40px;"></div>
            <h2>
                <img src="assets/material-design-icons/wallet.svg">
                <br>
                You don't have any wallet account,<br>
                create a new one or import an existing one<br>
                from the recovery phrase.
            </h2>
        `;
    }

    /**
     * Wallets list view
     */

    renderWalletsList() {

        // Accounts
        this.app.wallets.get().forEach(wallet => {

            // Native token as credit card
            this.content.append(new Card({
                app: this.app,
                wallet,
                click: () => {
                    if (!this.app.sheet.isOpen()) {
                        this.app.sheet.append({
                            title: `ICP wallet ${wallet.name}`,
                            component: new SheetAccountDetails({
                                app: this.app, wallet,
                                canisterId: this.app.ICP_LEDGER_CANISTER_ID
                            })
                        });
                    }
                }
            }).element);

        });

        this.buttonsInfo.innerHTML = 'Create next one or import an existing one';
    }

}
