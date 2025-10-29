/**
 * ICP Token implementation
 */

import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { idlFactory as idlICPIndex } from '/src/blockchain/InternetComputer/candid/icp-index.did.js';
import { Token } from '/src/blockchain/token.js';
import { ONE_MINUTE } from '/src/utils/general.js';
import { ICP2icpt } from '/src/utils/currency.js';

export class ICPToken extends Token {

    constructor({ app, wallet }) {
        super({
            app,
            wallet,
            canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            indexId: 'qhbym-qaaaa-aaaaa-aaafq-cai',
            name: 'Internet Computer Protocol',
            symbol: 'ICP',
            decimals: 8,
            fee: 10000,
        });
    }

    /**
     * Rebuild ICP token with actor
     */

    build({ agent }) {

        // Ledger Actor
        this.actor.ledger = LedgerCanister.create({ agent });

        // Index Actor
        this.actor.index = Actor.createActor(idlICPIndex, { agent, canisterId: this.canister.indexId });

        // Set ready flag
        this.ready = true;

    }

    /**
     * Check ICP balance
     */

    async balance() {

        try {
            const balance = await this.app.cache.get({
                id: `balance.${this.wallet.account}.${this.canister.ledgerId}`,
                overdue: ONE_MINUTE,
                create: async () => {
                    return await this.actor.ledger.accountBalance({ accountIdentifier: this.wallet.account });
                }
            });
            return balance;
        }
        catch (error) {
            if (error?.name === 'TransportError' && error?.cause?.code?.name === 'HttpFetchErrorCode') this.app.offline(true);
            console.error(error);
        }

        return null;
    }

    /**
     * Transfer ICP
     * @param account: string | Uint8Array - destination (Account ID)
     * @param amount: Number - amount of tokens to send
     */

    async transfer({ account, amount }) {

        if (typeof(account) == 'string') account = hexStringToUint8Array(account);

        try {
            const response = await this.actor.ledger.transfer({
                to: account,
                amount: ICP2icpt(amount, this.decimals),
                memo: this.memo++
            });
            return {'OK': response};
        }
        catch (error) {
            return {'ERROR': error};
        }
    }

    /**
     * Get transaction history from ICP Index canister
     * @param results: Number - number of results to fetch
     * @return { isodatetime: {
     *     type: 'send.token' | 'recv.token',
     *     pid: 'my principal id',
     *     to|from: { account: string },
     *     token: { canister: 'token principal id', amount: Number, fee: Number }
     * }, ...}
     */

    async transactions({ results = 100 } = {}) {
        const history = {};

        // Fetch transactions from ICP Index canister
        const response = await this.actor.index.get_account_transactions({
            max_results: results,
            start: [],
            account: {
                owner: Principal.fromText(this.wallet.principal),
                subaccount: [],
            }
        });

        // Parse response
        if (('Ok' in response) && ('transactions' in response.Ok)) {
            // Traverse transactions
            for (const record of response.Ok.transactions) {
                // Get transaction
                if (('transaction' in record) && ('operation' in record.transaction) && ('timestamp' in record.transaction) && record.transaction.timestamp.length) {

                    // Get timestamp
                    const datetime = new Date(Math.floor(Number(record.transaction.timestamp[0].timestamp_nanos) / 1e6)).toISOString();

                    // Transfer transaction
                    if ('Transfer' in record.transaction.operation) {

                        // Direction: 'send' | 'recv' | 'unknown'
                        const direction = record.transaction.operation.Transfer.from === this.wallet.account ? 'send' : record.transaction.operation.Transfer.to === this.wallet.account ? 'recv' : 'unknown';

                        // Compose data
                        const data = {
                            datetime,
                            type: `${direction}.token`,
                            pid: this.wallet.principal,
                            token: {
                                canister: this.canister.ledgerId,
                                amount: Number(record.transaction.operation.Transfer.amount.e8s),
                                fee: Number(record.transaction.operation.Transfer.fee.e8s)
                            }
                        };
                        if (direction === 'send') data.to = { account: record.transaction.operation.Transfer.to };
                        else if (direction === 'recv') data.from = { account: record.transaction.operation.Transfer.from };

                        // Save to history
                        history[datetime] = data;

                    }

                    // Approve transaction
                    else if ('Approve' in record.transaction.operation) {

                        // Compose data
                        const data = {
                            datetime,
                            type: 'aprv.token',
                            pid: this.wallet.principal,
                            to: { account: record.transaction.operation.Approve.spender },
                            token: {
                                canister: this.canister.ledgerId,
                                amount: Number(record.transaction.operation.Approve.allowance.e8s),
                                fee: Number(record.transaction.operation.Approve.fee.e8s)
                            }
                        };

                        // Save to history
                        history[datetime] = data;
                    }


                }
            }
        }

        return history;
    }

}
