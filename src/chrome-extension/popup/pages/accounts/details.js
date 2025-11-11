import { Component } from '/src/utils/component.js';
import { icpt2ICP, formatCurrency } from '/src/utils/currency.js';
import { Button, ButtIcon, ButtLink } from '/src/chrome-extension/popup/widgets/button.js';
import { AddPlus } from '/src/chrome-extension/popup/widgets/add.js';
import { TokenImage } from '/src/chrome-extension/popup/widgets/token-image.js';
import { SheetAccountSend } from './send-token.js';
import { SheetAccountReceive } from './receive-token.js';
import { SheetAddCustomToken } from './add-token.js';
import { SheetAddCustomNFT } from './add-nft.js';
import { SheetTransactionHistory } from './history.js';

export class SheetAccountDetails extends Component {

    constructor({ app, wallet, canister }) {
        super({ app });

        // App reference
        this.app = app;

        // Wallet reference
        this.wallet = wallet;

        // Token Ledger and Index canister IDs
        this.canister = canister;

        // Build
        this.element.classList.add('form');

        // Balance widget
        this.balance = document.createElement('h1');
        this.balance.style.marginTop = '0';
        this.balance.style.display = 'flex';
        this.balance.style.alignItems = 'center';
        this.element.append(this.balance);

        // Balance token logo
        const coin = new TokenImage({
            app: this.app,
            canisterId: this.canister.ledgerId,
            symbol: this.wallet.tokens.get(this.canister.canisterId).symbol
        });
        this.balance.append(coin.element);
        // Balance amount and symbol
        this.amount = document.createElement('span');
        this.amount.innerHTML = 'Fetching...';
        this.balance.append(this.amount);
        // Listener
        this.handleBalanceUpdate = () => this.updateBalance();
        document.body.addEventListener('update.balance', this.handleBalanceUpdate);
        this.updateBalance();

        // Buttons
        const buttonbar = document.createElement('div');
        buttonbar.classList.add('buttonbar');
        this.element.append(buttonbar);
        this.buttons = {
            send: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-up-bold.svg">',
                text: 'Send',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: `Send ${this.app.isICPLedger(this.canister.ledgerId) ? 'ICP' : 'tokens'} from ${this.wallet.name}`,
                        component: new SheetAccountSend({ app, wallet, canister })
                    });
                }
            }),
            receive: new ButtIcon({
                icon: '<img src="assets/material-design-icons/arrow-down-bold.svg">',
                text: 'Receive',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: `Receive ${this.app.isICPLedger(this.canister.ledgerId) ? 'ICP' : 'tokens'} to ${this.wallet.name}`,
                        component: new SheetAccountReceive({ app, wallet, canister })
                    });
                }
            }),
            swap: new ButtIcon({
                icon: '<img src="assets/material-design-icons/swap-horizontal-bold.svg">',
                text: 'Swap',
                click: () => {
                    chrome.tabs.create({ url: `https://app.icpswap.com/swap?input=${this.canister.ledgerId}&output=ryjl3-tyaaa-aaaaa-aaaba-cai` });
                }
            }),
            fiat: new ButtIcon({
                icon: '<img src="assets/material-design-icons/currency-usd.svg">',
                text: 'Fiat',
                click: () => {
                    chrome.tabs.create({ url: 'https://www.coinbase.com' });
                }
            })
        };
        Object.values(this.buttons).forEach(button => {
            buttonbar.append(button.element);
        });

        // Show transaction history
        this.append(new Button({
            icon: '<img src="assets/material-design-icons/history.svg">',
            text: 'Show transaction history',
            click: () => {
                this.app.sheet.clear();
                this.app.sheet.append({
                    title: `Transaction history of ${this.wallet.name}`,
                    component: new SheetTransactionHistory({
                        app,
                        wallet,
                        canister,
                        types: ['send.token', 'send.token.error', 'recv.token', 'add.nft', 'del.nft', 'send.nft.begin', 'send.nft.error'],
                        tokens: this.app.isICPLedger(this.canister.ledgerId) ? Object.keys(this.wallet.tokens.get()) : [this.canister.ledgerId],
                        nfts: this.app.isICPLedger(this.canister.ledgerId) ? Object.keys(this.wallet.nfts.get()) : []
                    })
                });
            }
        }));

        // Separator
        const sep = document.createElement('hr');
        sep.style.marginTop = '20px';
        this.element.append(sep);

        // On the main details sheet
        if (this.app.isICPLedger(this.canister.ledgerId)) {

            const horiz = document.createElement('div');
            horiz.style.display = 'flex';
            horiz.style.justifyContent = 'space-evenly';
            this.element.append(horiz);

            // Add custom token
            horiz.append(new AddPlus({
                text: 'Register token',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: 'Register custom token',
                        component: new SheetAddCustomToken({ app: this.app, wallet: this.wallet })
                    });
                }
            }).element);

            // Add NFT
            horiz.append(new AddPlus({
                text: 'Add NFT',
                click: () => {
                    this.app.sheet.clear();
                    this.app.sheet.append({
                        title: 'Add NFT',
                        component: new SheetAddCustomNFT({ app: this.app, wallet: this.wallet })
                    });
                }
            }).element);

            // Show in the dashboard
            this.append(new ButtLink({
                text: 'Show in ICP Dashboard',
                click: () => {
                    chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/account/${this.wallet.account}` });
                }
            }));

            // Edit name
            if (this.app.isICPLedger(this.canister.ledgerId)) {
                this.append(new ButtLink({
                    text: `Change wallet name`,
                    click: () => {
                        const newName = prompt('Enter new wallet name:', this.wallet.name);
                        if (newName !== null) {
                            this.app.sheet.update({ title: `ICP wallet ${newName.trim()}` });
                            this.wallet.name = newName.trim();
                            this.app.wallets.save();
                            document.body.dispatchEvent(new Event('update.name'));
                        }
                    }
                }));
            }

        } // ICP only

        // Token only
        else {

            // Show candid interface
            this.append(new ButtLink({
                text: `Show token's candid interface`,
                click: () => {
                    chrome.tabs.create({ url: `https://dashboard.internetcomputer.org/canister/${this.canister.ledgerId}` });
                }
            }));

        }

        // Remove
        this.append(new ButtLink({
            text: `Remove this ${(this.app.isICPLedger(this.canister.ledgerId)) ? 'account' : 'token'} from the list`,
            click: () => {

                // ICP
                if (this.app.isICPLedger(this.canister.ledgerId)) {
                    if (confirm('Delete this account?\nIt will only be removed from this list not from the blockchain - you can always recover it from the phrase.')) {
                        this.app.wallets.del(this.wallet.public);
                        this.app.wallets.save();
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                }

                // Token
                else {
                    if (confirm('Delete this token?\nIt will only be removed from this list not from the blockchain - you can always add it again.')) {
                        this.app.wallets.get(this.wallet.public).tokens.del(this.canister.ledgerId);
                        this.app.wallets.save();
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                }
            }
        }));
    }

    destructor() {
        document.body.removeEventListener('update.balance', this.handleBalanceUpdate);
    }

    updateBalance() {
        const token = this.wallet.tokens.get(this.canister.ledgerId);
        if (token) token.balance().then(balance => {
            if (balance !== null) {
                const amount = formatCurrency(icpt2ICP(balance, token.decimals), token.decimals);
                this.amount.innerText = `${amount} ${token.symbol}`;
                const tokenBalance = document.querySelector(`#balance_${this.wallet.principal}_${token.symbol} .amount`);
                if (tokenBalance) tokenBalance.innerText = formatCurrency(icpt2ICP(balance, token.decimals), 4);
            }
        });
    }

}
