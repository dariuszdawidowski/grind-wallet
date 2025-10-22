import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/button.js';
import { Card } from '/src/widgets/card.js';
import { TokenBalance } from '/src/widgets/token-balance.js';
import { Cover } from '/src/widgets/cover.js';
import { SheetNewAccount } from './New.js';
import { SheetImportAccount } from './Import.js';
import { SheetAccountDetails } from './Details.js';
import { SheetNFTDetails } from './DetailsNFT.js';
import { NFT } from '/src/blockchain/nft.js';
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
        this.app.wallets.get().forEach(wallet => {

            if ('rebuilded' in wallet) {

                // Native token as credit card
                this.append(new Card({
                    app: args.app,
                    wallet,
                    click: () => {
                        if (!this.app.sheet.isOpen()) {
                            this.app.sheet.append({
                                title: `ICP wallet ${wallet.name}`,
                                component: new SheetAccountDetails({
                                    app: args.app, wallet,
                                    canisterId: this.app.ICP_LEDGER_CANISTER_ID
                                })
                            });
                        }
                    }
                }));

                // Coins container
                const coins = document.createElement('div');
                coins.classList.add('coins');
                this.element.append(coins);

                // Custom tokens as coins
                if (wallet.tokens) Object.entries(wallet.tokens).forEach(([id, token]) => {
                    if (id != this.app.ICP_LEDGER_CANISTER_ID) {
                        const coin = new TokenBalance({
                            app: this.app,
                            canisterId: id,
                            wallet,
                            click: () => {
                                if (!this.app.sheet.isOpen()) {
                                    this.app.sheet.append({
                                        title: `${token.name} tokens @ ${wallet.name}`,
                                        component: new SheetAccountDetails({
                                            app: args.app,
                                            wallet,
                                            canisterId: id
                                        })
                                    });
                                }
                            }
                        });
                        coins.append(coin.element);
                    }
                });

                // NFTs container
                const nfts = document.createElement('div');
                nfts.classList.add('nfts');
                this.element.append(nfts);

                // NFTS as covers
                if (wallet.nfts) Object.entries(wallet.nfts).forEach(([id, nft]) => {
                    const fullNFT = new NFT({
                        app: args.app,
                        principal: wallet.principal,
                        agent: wallet.agent,
                        ...nft
                    });
                    const cover = new Cover({
                        wallet,
                        nft: fullNFT,
                        click: () => {
                            if (!this.app.sheet.isOpen()) {
                                const sheetNFTDetails = new SheetNFTDetails({
                                    app: args.app,
                                    wallet,
                                    nft: fullNFT
                                });
                                this.app.sheet.append({
                                    title: `NFT @ ${wallet.name}`,
                                    component: sheetNFTDetails
                                });
                                sheetNFTDetails.update();
                            }
                        }
                    });
                    nfts.append(cover.element);
                });

                // Separator
                this.element.append(document.createElement('hr'));

            }
            
        });

        // Horizontal drag of coins
        this.element.querySelectorAll('.coins').forEach(container => {

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
        });

        // Info
        const info = document.createElement('div');
        info.style.margin = '17px auto 7px auto';
        info.innerHTML = 'Create next one or import an existing one';
        this.element.append(info);

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

    }

}
