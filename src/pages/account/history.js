import { Component } from '/src/utils/Component.js';
import { TokenImage } from '/src/widgets/token-image.js';
import { Principal } from '@dfinity/principal';
import { shortAddress } from '/src/utils/General.js';

export class SheetTransactionHistory extends Component {

    constructor(args) {
        super(args);

        // CSS class
        this.element.classList.add('history');

        // References
        this.app = args.app;
        this.wallet = args.wallet;
        this.canisterId = args.canisterId;

        // Last rendered date
        this.lastDate = null;

        // Fetch logs from IndexedDB
        this.app.log.get({ pids: [this.wallet.principal], types: args.types, tokens: args.tokens }).then(logs => {
            const sortedLogs = Object.entries(logs).sort((a, b) => new Date(b[0]) - new Date(a[0]));
            if (Object.keys(sortedLogs).length > 0) {
                for (const [datetime, entry] of sortedLogs) {
                    this.render(datetime, entry);
                }
            }
            else {
                const info = document.createElement('h2');
                if (this.app.isICPLedger(args.tokens[0]))
                    info.textContent = `- No history on this wallet yet -`;
                else
                    info.textContent = `- No ${this.wallet.tokens[args.tokens[0]].symbol} history on this wallet yet -`;
                this.element.append(info);
            }
        });

        // Fetch and cache from blockchain
        this.fetchAndCache();
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

    render(datetime, entry) {

        // New date header?
        const date = datetime.slice(0, 10);
        if (date != this.lastDate) {
            this.renderDate(datetime);
            this.lastDate = date;
        }

        // Entry
        const row = document.createElement('div');
        row.classList.add('entry');
        this.element.append(row);

        // Is it own wallet?
        const otherPrincipalId = entry.type.startsWith('send.') ? entry.to?.principal : entry.type.startsWith('recv.') ? entry.from?.principal : null;
        let otherType = otherPrincipalId ? this.app.wallets.hasWallet(otherPrincipalId) ? 'own' : null : null;

        // Is it suspicious?
        if (otherPrincipalId && otherType === null && this.app.wallets.hasSimilarWallet(otherPrincipalId)) otherType = 'suspicious';

        // Send Token
        if (entry.type === 'send.token') this.renderEntry({
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${this.renderOtherAddress(entry.to?.principal || entry.to?.account)}`,
            amount: `-${entry.token.amount}`,
            type: otherType,
            canisterId: entry.token.canister
        });
        // Error send token
        else if (entry.type === 'send.token.error') this.renderEntry({
            kind: 'token',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send',
            subtitle: `To: ${this.renderOtherAddress(entry.to?.principal || entry.to?.account)}`,
            amount: `-${entry.token.amount}`,
            type: otherType,
            canisterId: entry.token.canister
        });
        // Receive Token
        else if (entry.type === 'recv.token') {
            const amount = parseFloat(entry.token.amount);
            let icon = 'assets/material-design-icons/arrow-down-bold.svg';
            if (otherType === 'suspicious' && amount <= 0.0001) icon = 'assets/material-design-icons/skull.svg';
            this.renderEntry({
                kind: 'token',
                parent: row,
                icon: icon,
                title: 'Receive',
                subtitle: `From: ${this.renderOtherAddress(entry.from?.principal || entry.from?.address)}`,
                amount: `+${entry.token.amount}`,
                type: otherType,
                canisterId: entry.token.canister
            });
        }
        // Add NFT
        else if (entry.type === 'add.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/plus.svg',
            title: 'Add NFT',
            subtitle: `Collection: ${this.renderOtherAddress(entry.nft.canister)}`,
            type: otherType,
            canisterId: entry.nft.canister
        });
        // Del NFT
        else if (entry.type === 'del.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/minus.svg',
            title: 'Remove NFT',
            type: otherType,
            canisterId: entry.nft.canister
        });
        // Send NFT
        else if (entry.type === 'send.nft') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send',
            subtitle: `To: ${this.renderOtherAddress(entry.to.principal)}`,
            type: otherType,
            canisterId: entry.nft.canister
        });
        // Error send NFT
        else if (entry.type === 'send.nft.error') this.renderEntry({
            kind: 'nft',
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send',
            subtitle: `To: ${this.renderOtherAddress(entry.to.principal)}`,
            type: otherType,
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
            amount.textContent = args.amount + ((args.kind === 'token') ? ` ${this.wallet.tokens[args.canisterId].symbol}` : '');
            args.parent.append(amount);
        }

    }

    /**
     * Render other principal ID / account ID as short code or name from own wallets/address book
     * 
     * @param {string} principalId | accountId
     * @returns {string|null}
     */

    renderOtherAddress(address) {
        const wallet = this.app.wallets.getByPrincipal(address) || this.app.wallets.getByAccount(address);
        if (wallet) return wallet.name;
        // const addrbook = this.app.addressbook.get(address);
        // if (addrbook) return addrbook.name;
        return shortAddress(address);
    }

    /**
     * Fetch and cache any missing data for log entries from a ledger or NFT canister
     */

    async fetchAndCache() {

        // Fetch transactions from ICP Index canister
        if (this.wallet.tokens[this.canisterId].index) {

            const response = await this.wallet.tokens[this.canisterId].index.get_account_transactions({
                max_results: 2,
                start: [],
                account: {
                    owner: Principal.fromText(this.wallet.principal),
                    subaccount: [],
                }
            });

            if (('Ok' in response) && ('transactions' in response.Ok)) {
                for (const record of response.Ok.transactions) {
                    // Get transaction
                    if (('transaction' in record) && ('operation' in record.transaction)) {
                        // Get timestamp
                        if (('timestamp' in record.transaction) && record.transaction.timestamp.length) {
                            const datetime = new Date(Math.floor(Number(record.transaction.timestamp[0].timestamp_nanos) / 1e6)).toISOString();
                            // Cache transfer transaction
                            if ('Transfer' in record.transaction.operation) {
                                // Direction: 'send' | 'recv' | 'unknown'
                                const direction = record.transaction.operation.Transfer.from === this.wallet.account ? 'send' : record.transaction.operation.Transfer.to === this.wallet.account ? 'recv' : 'unknown';
                                // console.log(record.transaction, datetime)
                                const entry = await this.app.log.get({ datetime }); // TODO: more params
                                if (!Object.keys(entry).length) {
                                    this.app.log.add({
                                        datetime,
                                        type: `${direction}.token`,
                                        pid: this.wallet.principal,
                                        to: {
                                            account: record.transaction.operation.Transfer.to,
                                        },
                                        token: {
                                            canister: this.canisterId,
                                            amount: Number(record.transaction.operation.Transfer.amount.e8s),
                                            fee: Number(record.transaction.operation.Transfer.fee.e8s)
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
            else {
                console.error(response);
            }

        }

    }

}

