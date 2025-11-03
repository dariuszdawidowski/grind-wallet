import { Component } from '/src/utils/component.js';
import { TokenImage } from '/src/chrome-extension/popup/widgets/token-image.js';
import { shortAddress } from '/src/utils/general.js';
import { icpt2ICP } from '/src/utils/currency.js';
import { ONE_MINUTE } from '/src/utils/general.js';

export class SheetTransactionHistory extends Component {

    constructor({ app, wallet, canister, types, tokens }) {
        super({ app });

        // CSS class
        this.element.classList.add('history');

        // References
        this.app = app;
        this.wallet = wallet;
        this.canister = canister;
        this.types = types; // ['send.token', 'recv.token', 'aprv.token', 'send.nft', 'add.nft', 'del.nft']
        this.tokens = tokens; // [canisterId1, canisterId2, ...]
        
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
                if (rebuild) document.body.dispatchEvent(new Event('update.history'));
            });
        });
        
    }

    /**
     * Render transaction history
     */

    async render() {
        this.clear();

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
            if (this.app.isICPLedger(this.canister.ledgerId)) {
                info.innerText = `No history on this wallet yet`;
            }
            else {
                const tokenTxt = this.wallet.tokens.get(this.canister.ledgerId)?.symbol || this.canister.ledgerId;
                if (this.canister.indexId) {
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
     */

    renderDate(isodate) {
        const dateObj = new Date(isodate);
        const humanDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const header = document.createElement('h2');
        header.innerText = humanDate;
        this.element.append(header);
    }

    /**
     * Render one entry
     */

    renderRow(entry) {

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

        // Determine recipient (is it own wallet? or suspicious?)
        const recipient = this.getRecipient(entry);

        // Send Token
        if (entry.type === 'send.token') this.renderEntry({
            type: entry.type,
            op: '-',
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${recipient.address}`,
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
            title: 'Error Send',
            subtitle: `To: ${recipient.address}`,
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
                subtitle: `From: ${recipient.address}`,
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
            canisterId: entry.nft.canister
        });
        // Del NFT
        else if (entry.type === 'del.nft') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/minus.svg',
            title: 'Remove NFT',
            other: recipient.type,
            canisterId: entry.nft.canister
        });
        // Send NFT
        else if (entry.type === 'send.nft') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${recipient.address}`,
            other: recipient.type,
            canisterId: entry.nft.canister
        });
        // Error send NFT
        else if (entry.type === 'send.nft.error') this.renderEntry({
            type: entry.type,
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send',
            subtitle: `To: ${recipient.address}`,
            other: recipient.type,
            canisterId: entry.nft.canister
        });

    }

    /**
     * Render entry template
     */

    renderEntry({ type, op = null, kind, parent, icon, title, subtitle = null, amount = null, other, canisterId }) {

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

        // Token image
        if (kind === 'token') {
            const coin = new TokenImage({
                app: this.app,
                canisterId: canisterId,
                wallet: this.wallet,
            });
            coin.element.style.marginRight = '6px';
            parent.append(coin.element);
        }

        // Amount
        if (amount) {
            const amountElement = document.createElement('div');
            if (type.endsWith('.error')) amountElement.style.textDecoration = 'line-through';
            amountElement.classList.add('amount');
            let text = '';
            if (op) text = op;
            text += icpt2ICP(amount, this.wallet.tokens.get(canisterId).decimals);
            text += (kind === 'token') ? ` ${this.wallet.tokens.get(canisterId).symbol}` : '';
            amountElement.innerText = text;
            parent.append(amountElement);
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
        const result = { type: 'unknown', address: null };
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
            // Fetch transactions for this token
            if (this.app.timestamps.expired({ id: `history:${this.wallet.principal}:${canisterId}`, overdue: ONE_MINUTE * 10 })) {
                const token = this.wallet.tokens.get(canisterId);
                const transactions = await token.transactions({ results: 100 });
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
        return rebuild;
    }

    /**
     * Reset
     */

    clear() {
        this.element.innerHTML = '';
        this.lastDate = null;
    }

}

