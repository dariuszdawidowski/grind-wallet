/**
 * Transaction history page
 */

import { Component } from '/src/utils/component.js';
import { TokenImage } from '/src/extension/popup/widgets/token-image.js';
import { NFTImage } from '/src/extension/popup/widgets/nft-image.js';
import { shortAddress, hashString } from '/src/utils/general.js';
import { icpt2ICP, formatCurrency } from '/src/utils/currency.js';
import { ONE_MINUTE, ONE_WEEK } from '/src/utils/general.js';
import { SheetHistoryDetails } from '/src/extension/popup/pages/accounts/history-details.js';
import { transactionNames } from '/src/utils/dictionary.js';

export class SheetTransactionHistory extends Component {

    /**
     * Constructor
     * @param {App} app Application instance
     * @param {Wallet} wallet Wallet instance
     * @param {Object} canister { ledgerId: string, indexId: string }
     * @param {Array} types List of log types to show
     * @param {Array} tokens List of canister IDs of tokens to show
     * @param {Array} nfts List of collectionId:id of NFTs to show
     */

    constructor({ app, wallet, canister, types, tokens, nfts }) {
        super({ app });

        // CSS class
        this.element.classList.add('history');

        // References
        this.wallet = wallet;
        this.canister = canister;
        this.types = types; // ['send.token', 'send.token.error', ...]
        this.tokens = tokens; // [canisterId1, canisterId2, ...]
        this.nfts = nfts; // [collectionId1:id, collectionId2:id, ...]
        
        // Logs cache
        this.logs = {};

        // Last rendered date
        this.lastDate = null;
        
        // Redraw
        this.handleHistoryUpdate = () => this.render();
        document.body.addEventListener('update.history', this.handleHistoryUpdate);

        // Read logs from IndexedDB
        this.app.log.get(this.wallet.principal, { types: this.types, tokens: this.tokens }).then(logs => {
            this.logs = logs;
            this.render();
            // Fetch and cache from blockchain
            this.fetchAndCache().then((rebuild) => {
                const loader = document.getElementById('history-loader');
                if (loader) loader.style.display = 'none';
                if (rebuild) document.body.dispatchEvent(new Event('update.history'));
            });
        });
        
    }

    /**
     * Render transaction history
     */

    async render() {
        this.clear();

        // Loader
        const loader = document.createElement('div');
        loader.id = 'history-loader';
        loader.style.margin = '0 auto';
        loader.style.display = 'none';
        loader.classList.add('loader', 'dark');
        this.element.append(loader);

        // Show logs
        if (Object.keys(this.logs).length > 0) {
            // Sort by datetime descending
            const sortedLogs = Object.entries(this.logs).sort((a, b) => new Date(b[1].datetime) - new Date(a[1].datetime));
            for (const [_, entry] of sortedLogs) {
                this.renderRow(entry);
            }
        }

        // No logs
        else {
            const info = document.createElement('h2');
            if (this.app.isICP(this.canister.ledgerId)) {
                loader.style.display = 'block';            
                info.innerText = `No history on this wallet yet`;
            }
            else {
                const tokenTxt = this.wallet.tokens.get(this.canister.ledgerId)?.symbol || this.canister.ledgerId;
                if (this.canister.indexId) {
                    loader.style.display = 'block';            
                    info.innerText = `No ${tokenTxt} history on this wallet yet`;
                }
                else {
                    info.innerText = `Token ${tokenTxt} has no registered index so history will not be displayed`;
                }
            }
            this.element.append(info);
        }
    }

    /**
     * Render human readable and locale date header
     * @param {string} isodate ISO date string
     */

    renderDate(isodate) {
        // Year gap
        if (this.lastDate && isodate.slice(0, 4) !== this.lastDate.slice(0, 4)) {
            const yearHeader = document.createElement('h1');
            yearHeader.style.marginTop = '32px';
            yearHeader.innerText = isodate.slice(0, 4);
            this.element.append(yearHeader);
        }
        // Date header
        const dateObj = new Date(isodate);
        const humanDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const header = document.createElement('h2');
        header.style.marginTop = '1.5em';
        header.innerText = humanDate;
        this.element.append(header);
    }

    /**
     * Render one entry
     * @param {object} entry log row
     */

    renderRow(entry) {

        // Determine recipient (is it own wallet? or suspicious?)
        const recipient = this.getRecipient(entry);

        // New date header
        const date = entry.datetime.slice(0, 10);
        if (date != this.lastDate) {
            this.renderDate(entry.datetime);
            this.lastDate = date;
        }

        // Entry
        const row = document.createElement('div');
        row.classList.add('entry');
        this.element.append(row);
        row.addEventListener('click', () => {
            this.app.sheet.append({
                title: transactionNames[entry.type] || 'Transaction details',
                component: new SheetHistoryDetails({ app: this.app, transaction: entry, wallet: this.wallet, recipient })
            });
        });

        // Send Token
        if (entry.type === 'send.token') this.renderEntry({
            type: entry.type,
            op: '-',
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${recipient.name || recipient.address}`,
            amount: entry.token.amount,
            other: recipient.type,
            canisterId: entry.token.canister
        });

        // Error send token
        else if (entry.type === 'send.token.error') this.renderEntry({
            type: entry.type,
            op: '-',
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Sending',
            subtitle: `To: ${recipient.name || recipient.address}`,
            amount: entry.token.amount,
            other: recipient.type,
            canisterId: entry.token.canister
        });

        // Receive Token
        else if (entry.type === 'recv.token') {
            const amount = parseFloat(entry.token.amount);
            let icon = 'assets/material-design-icons/arrow-down-bold.svg';
            if (recipient.type === 'suspicious' && amount <= 0.0001) icon = 'assets/material-design-icons/skull.svg';
            this.renderEntry({
                type: entry.type,
                op: '+',
                kind: 'token',
                parent: row,
                icon: icon,
                title: 'Receive',
                subtitle: `From: ${recipient.name || recipient.address}`,
                amount: entry.token.amount,
                other: recipient.type,
                canisterId: entry.token.canister
            });
        }

        // Add NFT
        else if (entry.type === 'add.nft') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/plus.svg',
            title: 'Add NFT',
            subtitle: `Collection: ${shortAddress(entry.nft.canister)}`,
            other: recipient.type,
            canisterId: entry.nft.canister,
            nftId: entry.nft.id
        });

        // Del NFT
        else if (entry.type === 'del.nft') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/minus.svg',
            title: 'Remove NFT',
            subtitle: `Collection: ${shortAddress(entry.nft.canister)}`,
            other: recipient.type,
            canisterId: entry.nft.canister,
            nftId: entry.nft.id
        });

        // Send NFT
        else if (entry.type === 'send.nft.begin') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send NFT',
            subtitle: `To: ${recipient.name || recipient.address}`,
            other: recipient.type,
            canisterId: entry.nft.canister,
            nftId: entry.nft.id
        });

        // Error send NFT
        else if (entry.type === 'send.nft.error') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Sending NFT',
            subtitle: `To: ${recipient.name || recipient.address}`,
            other: recipient.type,
            canisterId: entry.nft.canister,
            nftId: entry.nft.id
        });

    }

    /**
     * Render entry template
     * @param {string} type Entry type (e.g., 'send.token', 'recv.token', etc.)
     * @param {string} [op] Operation sign (+ or -)
     * @param {string} kind 'token' | 'nft'
     * @param {HTMLElement} parent Parent element
     * @param {string} icon Icon URL
     * @param {string} title Title text
     * @param {string} [subtitle] Subtitle text (address)
     * @param {string} [amount] Amount value
     * @param {string} [other] 'own' | 'suspicious' | null
     * @param {string} canisterId Token ledger/NFT collection canister ID
     * @param {string} [nftId] NFT ID
     */

    renderEntry({ type, op = null, kind, parent, icon, title, subtitle = null, amount = null, other, canisterId, nftId = null }) {

        // Icon circle container
        const logo = document.createElement('div');
        logo.classList.add('circle');
        if (type.endsWith('.error')) logo.classList.add('error');
        else if (type.startsWith('recv.')) logo.classList.add('recv');
        parent.append(logo);

        // Icon image
        const image = document.createElement('img');
        image.src = icon;
        logo.append(image);

        // Description container
        const desc = document.createElement('div');
        desc.style.marginLeft = '10px';
        parent.append(desc);

        // Title
        const titleElement = document.createElement('div');
        titleElement.classList.add('title');
        titleElement.innerText = title;
        desc.append(titleElement);

        // Subtitle
        if (subtitle) {
            const subtitleElement = document.createElement('div');
            subtitleElement.classList.add('subtitle');
            let badge = '';
            if (other === 'own') badge = ' <span class="own">own</span>';
            else if (other === 'suspicious') badge = ' <span class="own suspicious">suspicious</span>';
            subtitleElement.innerHTML = subtitle + badge;
            desc.append(subtitleElement);
        }

        // Amount
        if (amount) {
            const amountElement = document.createElement('div');
            if (type.endsWith('.error')) amountElement.style.textDecoration = 'line-through';
            amountElement.classList.add('amount');
            let text = '';
            if (op) text = op;
            text += formatCurrency(icpt2ICP(amount, this.wallet.tokens.get(canisterId).decimals), 4);
            text += '<br>';
            text += (kind === 'token') ? this.wallet.tokens.get(canisterId).symbol : '';
            amountElement.innerHTML = text;
            parent.append(amountElement);
        }

        // Token image
        if (kind === 'token') {
            const coin = new TokenImage({
                app: this.app,
                canisterId: canisterId,
                symbol: this.wallet.tokens.get(canisterId).symbol
            });
            if (this.app.isICP(canisterId)) {
                coin.element.style.backgroundColor = '#eee';
                coin.element.style.backgroundSize = '20px';
            }
            parent.append(coin.element);
        }
        // NFT miniature
        else if (kind === 'nft') {
            const miniature = new NFTImage({
                app: this.app,
                canisterId: canisterId,
                nftId: nftId
            });
            parent.append(miniature.element);
        }

    }

    /**
     * Determine recipient type (based on principal ID / account ID)
     * @param {object} entry log entry
     * @returns {
     *   type: 'own' | 'suspicious' | 'unknown', // recipient type
     *   address: string // human readable address (shortened or name)
     * }
     */

    getRecipient(entry) {
        const result = { type: 'unknown', address: null, name: null };
        let principal = null;
        let account = null;

        // Determine which address to check
        if (entry.type.startsWith('send.')) {
            if ('principal' in entry.to) {
                principal = entry.to.principal;
            }
            else if ('account' in entry.to) {
                account = entry.to.account;
            }
        }
        else if (entry.type.startsWith('recv.')) {
            if ('principal' in entry.from) {
                principal = entry.from.principal;
            }
            else if ('account' in entry.from) {
                account = entry.from.account;
            }
            
        }

        if (principal) {
            // My principal
            const wallet = this.app.wallets.getByPrincipal(principal);
            if (wallet) {
                result.address = wallet.name;
                result.type = 'own';
            }
            // Other principal
            else {
                result.address = shortAddress(principal);
                if (this.app.wallets.hasSimilarPrincipal(principal)) result.type = 'suspicious';
            }
        }
        else if (account) {
            // My account
            const wallet = this.app.wallets.getByAccount(account);
            if (wallet) {
                result.address = wallet.name;
                result.type = 'own';
            }
            // Other account
            else {
                result.address = shortAddress(account);
                if (this.app.wallets.hasSimilarAccount(account)) result.type = 'suspicious';
            }
        }

        // Try to find in address book
        const contact = this.app.addressbook.getByAddress(principal || account);
        if (contact) {
            result.name = contact.name;
            if (contact.group == 'my') result.type = 'own';
            else result.type = 'known';
        }

        return result;
    }

    /**
     * Fetch and cache any missing data for log entries from a ledger or NFT canister
     * @return {boolean} - true if new entries were added
     */

    async fetchAndCache() {
        let rebuild = false;
        // Traverse list of tokens
        for (const canisterId of this.tokens) {
            if (this.app.cache.info.get({ id: `history:${this.wallet.principal}:${canisterId}`, overdue: ONE_MINUTE * 10 })) {
                // Get token
                const token = this.wallet.tokens.get(canisterId);
                if (token) {
                    // Refresh token info in weekly basis
                    if (!this.app.isICP(canisterId) && this.app.cache.info.get({ id: `token:${canisterId}`, overdue: ONE_WEEK })) {
                        let changed = false;
                        // Compare current vs new
                        const oldData = token.serialize();
                        const metadata = await token.metadata(); // token data updated internally
                        const newData = token.serialize();
                        const oldImage = await this.app.cache.image.load(`token:${canisterId}`);
                        const oldImageHash = oldImage ? await hashString(oldImage) : null;
                        const newImageHash = metadata.logo ? await hashString(metadata.logo) : null;
                        // Token data has changed
                        if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                            await this.app.wallets.save();
                            changed = true;
                        }
                        // Image logo has changed
                        if (oldImageHash !== newImageHash) {
                            await this.app.cache.image.save(`token:${canisterId}`, metadata.logo);
                            changed = true;
                        }
                        if (changed) document.body.dispatchEvent(new Event('render.all'));
                    }
                    // Fetch transactions for this token
                    const transactions = await token.transactions({ results: 100, types: this.types });
                    for (const [key, entry] of Object.entries(transactions)) {
                        const existingEntry = this.logs[key] || null;
                        if (!existingEntry) {
                            this.logs[key] = entry;
                            this.app.log.add(this.wallet.principal, key, entry);
                            rebuild = true;
                        }
                    }
                }
            }
        }
        return rebuild;
    }

    /**
     * Reset
     */

    clear() {
        this.element.replaceChildren();
        this.lastDate = null;
    }

}

