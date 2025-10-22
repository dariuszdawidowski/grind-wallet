import { Component } from '/src/utils/Component.js';
import { TokenImage } from '/src/widgets/token-image.js';
import { Principal } from '@dfinity/principal';
import { shortAddress } from '/src/utils/General.js';
import { icpt2ICP } from '/src/utils/Currency.js';

export class SheetTransactionHistory extends Component {

    constructor(args) {
        super(args);

        // CSS class
        this.element.classList.add('history');

        // References
        this.app = args.app;
        this.wallet = args.wallet;
        this.canisterId = args.canisterId;
        this.types = args.types; // ['send.token', 'recv.token', 'send.nft', 'add.nft', 'del.nft']
        this.tokens = args.tokens; // [canisterId1, canisterId2, ...]
        console.log(this.wallet)

        // Last rendered date
        this.lastDate = null;

        // Fetch logs from IndexedDB
        this.render();

        // Fetch and cache from blockchain
        this.fetchAndCache();
    }

    /**
     * Render transaction history
     */

    async render() {
        // Clear
        this.element.innerHTML = '';

        // Read logs from IndexedDB
        const logs = await this.app.log.get({ pids: [this.wallet.principal], types: this.types, tokens: this.tokens });
        const sortedLogs = Object.entries(logs).sort((a, b) => new Date(b[0]) - new Date(a[0]));
        if (Object.keys(sortedLogs).length > 0) {
            for (const [datetime, entry] of sortedLogs) {
                this.renderRow(datetime, entry);
            }
        }
        else {
            const info = document.createElement('h2');
            if (this.app.isICPLedger(this.tokens[0]))
                info.textContent = `- No history on this wallet yet -`;
            else
                info.textContent = `- No ${this.wallet.tokens[this.tokens[0]].symbol} history on this wallet yet -`;
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
        header.textContent = humanDate;
        this.element.append(header);
    }

    /**
     * Render one entry
     */

    renderRow(datetime, entry) {

        // New date header
        const date = datetime.slice(0, 10);
        if (date != this.lastDate) {
            this.renderDate(datetime);
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
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${recipient.address}`,
            amount: `-${entry.token.amount}`,
            type: recipient.type,
            canisterId: entry.token.canister
        });
        // Error send token
        else if (entry.type === 'send.token.error') this.renderEntry({
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send',
            subtitle: `To: ${recipient.address}`,
            amount: `-${entry.token.amount}`,
            type: recipient.type,
            canisterId: entry.token.canister
        });
        // Receive Token
        else if (entry.type === 'recv.token') {
            const amount = parseFloat(entry.token.amount);
            let icon = 'assets/material-design-icons/arrow-down-bold.svg';
            if (recipient.type === 'suspicious' && amount <= 0.0001) icon = 'assets/material-design-icons/skull.svg';
            this.renderEntry({
                kind: 'token',
                parent: row,
                icon: icon,
                title: 'Receive',
                subtitle: `From: ${recipient.address}`,
                amount: `+${entry.token.amount}`,
                type: recipient.type,
                canisterId: entry.token.canister
            });
        }
        // Add NFT
        else if (entry.type === 'add.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/plus.svg',
            title: 'Add NFT',
            subtitle: `Collection: ${shortAddress(entry.nft.canister)}`,
            type: recipient.type,
            canisterId: entry.nft.canister
        });
        // Del NFT
        else if (entry.type === 'del.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/minus.svg',
            title: 'Remove NFT',
            type: recipient.type,
            canisterId: entry.nft.canister
        });
        // Send NFT
        else if (entry.type === 'send.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${recipient.address}`,
            type: recipient.type,
            canisterId: entry.nft.canister
        });
        // Error send NFT
        else if (entry.type === 'send.nft.error') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send',
            subtitle: `To: ${recipient.address}`,
            type: recipient.type,
            canisterId: entry.nft.canister
        });

    }

    /**
     * Render entry template
     */

    renderEntry(args) {

        // Icon circle container
        const icon = document.createElement('div');
        icon.classList.add('circle');
        args.parent.append(icon);

        // Icon image
        const image = document.createElement('img');
        image.src = args.icon;
        icon.append(image);

        // Description container
        const desc = document.createElement('div');
        desc.style.marginLeft = '10px';
        args.parent.append(desc);

        // Title
        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = args.title;
        desc.append(title);

        // Subtitle
        if ('subtitle' in args) {
            const subtitle = document.createElement('div');
            subtitle.classList.add('subtitle');
            let badge = '';
            if (args.type === 'own') badge = ' <span class="own">own</span>';
            else if (args.type === 'suspicious') badge = ' <span class="own suspicious">suspicious</span>';
            subtitle.innerHTML = args.subtitle + badge;
            desc.append(subtitle);
        }

        // Token image
        if (args.kind === 'token') {
            const coin = new TokenImage({
                app: this.app,
                canisterId: args.canisterId,
                wallet: this.wallet,
            });
            coin.element.style.marginRight = '6px';
            args.parent.append(coin.element);
        }

        // Amount
        if ('amount' in args) {
            const amount = document.createElement('div');
            amount.classList.add('amount');
            amount.textContent = icpt2ICP(args.amount, this.wallet.tokens[args.canisterId].decimals) + ((args.kind === 'token') ? ` ${this.wallet.tokens[args.canisterId].symbol}` : '');
            args.parent.append(amount);
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
     */

    async fetchAndCache() {

        // Fetch transactions from ICP Index canister
        if (this.wallet.tokens[this.canisterId].index) {

            const response = await this.wallet.tokens[this.canisterId].index.get_account_transactions({
                max_results: 100,
                start: [],
                account: {
                    owner: Principal.fromText(this.wallet.principal),
                    subaccount: [],
                }
            });

            if (('Ok' in response) && ('transactions' in response.Ok)) {
                // Traverse transactions
                for (const record of response.Ok.transactions) {
                    // Get transaction
                    if (('transaction' in record) && ('operation' in record.transaction) && ('timestamp' in record.transaction) && record.transaction.timestamp.length) {
                        // Get timestamp
                        const datetime = new Date(Math.floor(Number(record.transaction.timestamp[0].timestamp_nanos) / 1e6)).toISOString();

                        // Cache transfer transaction
                        if ('Transfer' in record.transaction.operation) {
                            // Direction: 'send' | 'recv' | 'unknown'
                            const direction = record.transaction.operation.Transfer.from === this.wallet.account ? 'send' : record.transaction.operation.Transfer.to === this.wallet.account ? 'recv' : 'unknown';
                            const entry = await this.app.log.get({ datetime }); // TODO: more params
                            if (!Object.keys(entry).length) {
                                const data = {
                                    datetime,
                                    type: `${direction}.token`,
                                    pid: this.wallet.principal,
                                    token: {
                                        canister: this.canisterId,
                                        amount: Number(record.transaction.operation.Transfer.amount.e8s),
                                        fee: Number(record.transaction.operation.Transfer.fee.e8s)
                                    }
                                };
                                if (direction === 'send') data.to = { account: record.transaction.operation.Transfer.to };
                                else if (direction === 'recv') data.from = { account: record.transaction.operation.Transfer.from };
                                this.app.log.add(data);
                            }
                        }

                        // Cache approve transaction
                        if ('Approve' in record.transaction.operation) {
                            const entry = await this.app.log.get({ datetime }); // TODO: more params
                            if (!Object.keys(entry).length) {
                                const data = {
                                    datetime,
                                    type: 'aprv.token',
                                    pid: this.wallet.principal,
                                    to: { account: record.transaction.operation.Approve.spender },
                                    token: {
                                        canister: this.canisterId,
                                        amount: Number(record.transaction.operation.Approve.allowance.e8s),
                                        fee: Number(record.transaction.operation.Approve.fee.e8s)
                                    }
                                };
                                this.app.log.add(data);
                            }
                        }
                    }
                }
                this.render();
            }
            else {
                console.error(response);
            }

        }

    }

}

