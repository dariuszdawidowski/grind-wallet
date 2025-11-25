/**
 * Page: List of Accounts
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { Card } from '/src/chrome-extension/popup/widgets/card.js';
import { TokenBalance } from '/src/chrome-extension/popup/widgets/token-balance.js';
import { Cover } from '/src/chrome-extension/popup/widgets/cover.js';
import { SheetNewAccount } from '/src/chrome-extension/popup/pages/accounts/new.js';
import { SheetImportAccount } from '/src/chrome-extension/popup/pages/accounts/import.js';
import { SheetAccountDetails } from '/src/chrome-extension/popup/pages/accounts/details.js';
import { SheetNFTDetails } from '/src/chrome-extension/popup/pages/accounts/details-nft.js';

export class PageAccounts extends Component {

    constructor(args) {
        super(args);

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
        title.innerHTML = `Grind Wallet <span style="font-size: 12px;">v${this.app.version}</span>`;
        header.append(title);

        // Task manager
        this.append(this.app.tasks);

        // Separator
        const taskSeparator = document.createElement('hr');
        taskSeparator.id = 'task-separator';
        this.element.append(taskSeparator);
        if (!this.app.tasks.update()) taskSeparator.style.display = 'none';

        // Main content with cards
        this.content = document.createElement('div');
        this.element.append(this.content);

        // Info
        this.buttonsInfo = document.createElement('div');
        this.buttonsInfo.style.margin = '17px auto 7px auto';
        this.element.append(this.buttonsInfo);

        // Button: Create account
        this.append(new Button({
            text: 'Create account',
            click: () => {
                this.app.sheet.append({
                    title: 'Create new account',
                    component: new SheetNewAccount(args)
                });
            }
        }));

        // Button: Import account
        this.append(new Button({
            text: 'Import account',
            click: () => {
                this.app.sheet.append({
                    title: 'Import existing account',
                    component: new SheetImportAccount(args)
                });
            }
        }));

        // Security and Privacy info
        const info = document.createElement('p');
        info.classList.add('end');
        info.style.textAlign = 'center';
        info.style.marginTop = '30px';
        info.innerHTML = `
            <a href="https://www.grindwallet.com/en/security/" target="_blank" style="color: #f1e6fd;">Security</a> &bull; <a href="https://www.grindwallet.com/en/privacy/" target="_blank" style="color: #f1e6fd;">Privacy</a>
        `;
        this.element.append(info);

        // Render wallets
        document.body.addEventListener('render.all', () => {
            this.content.innerHTML = '';
            // No wallets
            if (this.app.wallets.count() === 0) {
                this.renderNoWallets();
            }
            // Wallets available
            else {
                // Intentionally not awaiting
                this.app.log.init('Logs', this.app.wallets.get().map(wallet => wallet.principal));
                // Render wallets list
                this.renderWalletsList();
            }
        });

        // Get wallets and render
        this.app.wallets.load().then(() => {
            document.body.dispatchEvent(new Event('render.all'));
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
            this.renderWallet(wallet);
        });

        // Info
        this.buttonsInfo.innerHTML = 'Create next one or import an existing one';
    }

    /**
     * Render single wallet as a 'credit card'
     */

    renderWallet(wallet) {

        this.content.append(new Card({
            app: this.app,
            wallet,
            click: () => this.openICPWalletSheet(wallet)
        }).element);

        // Coins container
        const coins = document.createElement('div');
        coins.classList.add('coins');
        this.content.append(coins);

        // Custom tokens as coins
        if (wallet.tokens.count()) Object.entries(wallet.tokens.get()).forEach(([id, token]) => {
            if (id != this.app.ICP_LEDGER_CANISTER_ID) {
                const coin = new TokenBalance({
                    app: this.app,
                    canisterId: id,
                    wallet,
                    click: () => this.openTokenWalletSheet(wallet, token)
                });
                coins.append(coin.element);
            }
        });

        // Horizontal drag of coins
        this.horizontalDrag(coins);

        // NFTs container
        const nfts = document.createElement('div');
        nfts.classList.add('nfts');
        this.content.append(nfts);

        // NFTS as covers
        if (wallet.nfts.count()) Object.entries(wallet.nfts.get()).forEach(([id, nft]) => {
            const cover = new Cover({
                app: this.app,
                wallet,
                nft,
                click: () => this.openNFTDetailsSheet(wallet, nft)
            });
            nfts.append(cover.element);
        });

        // Horizontal drag of nfts
        this.horizontalDrag(nfts);

        // Separator
        this.content.append(document.createElement('hr'));

    }

    /**
     * Enable horizontal drag on container
     */

    horizontalDrag(container) {
        let isDragging = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            event.preventDefault();
            const x = event.pageX - container.offsetLeft;
            const walk = (x - startX) * 1;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    /**
     * Open ICP Wallet sheet
     */

    openICPWalletSheet(wallet) {
        if (!this.app.sheet.isOpen()) {
            this.app.sheet.append({
                title: `ICP wallet ${wallet.name}`,
                component: new SheetAccountDetails({
                    app: this.app,
                    wallet,
                    canister: { ledgerId: this.app.ICP_LEDGER_CANISTER_ID, indexId: this.app.ICP_INDEX_CANISTER_ID }
                })
            });
        }
    }

    /**
     * Open Token Wallet sheet
     */

    openTokenWalletSheet(wallet, token) {
        if (!this.app.sheet.isOpen()) {
            this.app.sheet.append({
                title: `${token.name} tokens @ ${wallet.name}`,
                component: new SheetAccountDetails({
                    app: this.app,
                    wallet,
                    canister: { ledgerId: token.canister.ledgerId, indexId: token.canister.indexId }
                })
            });
        }
    }

    /**
     * Open NFT Details sheet
     */

    openNFTDetailsSheet(wallet, nft) {
        if (!this.app.sheet.isOpen()) {
            const sheetNFTDetails = new SheetNFTDetails({
                app: this.app,
                wallet,
                nft
            });
            this.app.sheet.append({
                title: `NFT @ ${wallet.name}`,
                component: sheetNFTDetails
            });
            sheetNFTDetails.update();
        }
    }

}
