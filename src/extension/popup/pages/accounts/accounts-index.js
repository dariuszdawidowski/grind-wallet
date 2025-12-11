/**
 * Page: List of Accounts
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/extension/popup/widgets/button.js';
import { Card } from '/src/extension/popup/widgets/card.js';
import { TokenBalance } from '/src/extension/popup/widgets/token-balance.js';
import { Cover } from '/src/extension/popup/widgets/cover.js';
import { SheetNewAccount } from '/src/extension/popup/pages/accounts/new.js';
import { SheetImportAccount } from '/src/extension/popup/pages/accounts/import.js';
import { SheetAccountDetails } from '/src/extension/popup/pages/accounts/details.js';
import { SheetNFTDetails } from '/src/extension/popup/pages/accounts/details-nft.js';
import { BurgerMenu } from '/src/extension/popup/menus/burger-menu.js';

export class PageAccounts extends Component {

    constructor(args) {
        super(args);

        // Check valid session at each return to extension
        this.boundCheckSession = this.app.checkSession.bind(this.app);
        document.addEventListener('visibilitychange', this.boundCheckSession);

        // Show tab bar
        if (process.env.DEV_MODE === '1' && this.app.tabbar.isHidden()) {
            this.app.tabbar.show();
            this.app.tabbar.accounts.select();
        }

        // Build
        this.element.classList.add('page');

        // Header
        const header = document.createElement('h1');
        header.classList.add('product-title');
        const img = document.createElement('img');
        img.classList.add('product-logo');
        img.src = 'assets/icon16.png';
        header.append(img);
        const title = document.createElement('span');
        const titleText = document.createElement('span');
        titleText.textContent = 'Grind Wallet';
        title.append(titleText);
        const versionText = document.createElement('span');
        versionText.style.marginLeft = '4px';
        versionText.style.fontSize = '12px';
        versionText.textContent = `v${this.app.version}`;
        title.append(versionText);
        header.append(title);
        this.element.append(header);
        
        // Burger menu icon
        const burger = document.createElement('img');
        burger.src = 'assets/material-design-icons/menu.svg';
        burger.classList.add('burger');
        burger.addEventListener('click', () => {
            if (!this.app.drawer.isOpen()) {
                this.app.drawer.clear();
                this.app.drawer.append(this.burgerMenu);
                if (!this.burgerMenu.isRendered()) this.burgerMenu.render();
                this.app.drawer.open();
            }
            else {
                this.app.drawer.close();
            }
        });
        header.append(burger);

        // Burger menu
        this.burgerMenu = new BurgerMenu({ app: this.app });

        // Task manager
        if (process.env.DEV_MODE !== '1') this.append(this.app.tasks);

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
            this.content.replaceChildren();
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
            this.app.addressbook.load().then(() => {
                document.body.dispatchEvent(new Event('render.all'));
            });
        });

    }

    /**
     * Destructor
     */

    destructor() {
        document.removeEventListener('visibilitychange', this.boundCheckSession);
    }

    /**
     * No wallets view
     */

    renderNoWallets() {
        this.content.innerHTML = `
            <div class="biglogo backlight" style="background-image: url(assets/icon728.png); margin-bottom: 40px;"></div>
            <h2>
                <img src="assets/material-design-icons/wallet-white.svg">
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
        this.buttonsInfo.innerText = 'Create next one or import an existing one';
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
                onTitleEdit: () => {
                    const newName = prompt('Enter new wallet name:', wallet.name);
                    if (newName !== null) {
                        this.app.sheet.update({ title: `ICP wallet ${newName.trim()}` });
                        wallet.name = newName.trim();
                        this.app.wallets.save();
                        document.body.dispatchEvent(new Event('update.name'));
                    }
                },
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
