/**
 * ICRC Token implementation
 */

import { Actor } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { idlFactory as idlICRCIndex } from '/src/blockchain/InternetComputer/candid/icrc-index.did.js';
import { Token } from '/src/blockchain/token.js';
import { ICP2icpt } from '/src/utils/currency.js';
import { ONE_MINUTE, memo2Binary, timestampNanos2ISO } from '/src/utils/general.js';

export class ICRCToken extends Token {

    /**
     * Rebuild ICRC token with actors (quicker method for registered tokens)
     */

    build({ agent }) {
        // Ledger Actor
        if (this.canister.ledgerId && !this.actor.ledger) this.actor.ledger = IcrcLedgerCanister.create({ agent, canisterId: this.canister.ledgerId });

        // Index Actor
        if (this.canister.indexId && !this.actor.index) this.actor.index = Actor.createActor(idlICRCIndex, { agent, canisterId: this.canister.indexId });

        // Set ready flag
        this.ready = true;
    }

    /**
     * Get metadata
     * @returns Dictionary with metadata
     */

    async metadata() {
        let data = {};

        // ICRC-1 metadata
        const icrc1Metadata = await this.actor.ledger.metadata({});
        if (icrc1Metadata) {
            const normalizedEntries = icrc1Metadata.map(([key, value]) => {
                if (typeof key === 'string') {
                    const parts = key.split(':');
                    const cleanValue = ('Text' in value) ? value.Text : ('Nat' in value) ? Number(value.Nat) : value;
                    return [parts[parts.length - 1], cleanValue];
                }
                return [key, value];
            });
            data = Object.fromEntries(normalizedEntries);
            if (('name' in data) && ('symbol' in data) && ('decimals' in data) && ('fee' in data)){
                this.name = data['name'];
                this.symbol = data['symbol'];
                this.decimals = Number(data['decimals']);
                this.fee = Number(data['fee']);
                this.valid = true;
                data['standards'] = ['ICRC-1'];
            }

        }

        // ICRC-10 supported standards
        try {
            const standards = await this.actor.ledger.service.icrc10_supported_standards();
            const standardNames = standards
                .map((standard) => {
                    if (typeof standard?.name === 'string') return standard.name;
                    if (standard?.name?.Text) return standard.name.Text;
                    return null;
                })
                .filter(Boolean);
            data['standards'] = standardNames;
        }
        catch (_) {}

        // ICRC-106 get index principal
        if (!('index_principal' in data)) {
            try {
                const icrc106IndexId = await this.actor.ledger.service.icrc106_get_index_principal();
                if ('Ok' in icrc106IndexId) data['index_principal'] = { 'Text': icrc106IndexId.Ok.toText() };
            }
            catch (_) {}
        }

        // Test index canister
        if ('index_principal' in data) {
            if (data['index_principal'] && Principal.isPrincipal(Principal.fromText(data['index_principal']))) {
                this.canister.indexId = data['index_principal'];
                if (!this.actor.index) {
                    this.actor.index = Actor.createActor(idlICRCIndex, { agent: this.app.agent, canisterId: this.canister.indexId });
                }
                let status = null;
                let fetchLedgerId = null;
                try {
                    status = await this.actor.index.status();
                    fetchLedgerId = await this.actor.index.ledger_id();
                } catch (_) {}
                if (status && ('num_blocks_synced' in status) && fetchLedgerId && fetchLedgerId.toText() === this.canister.ledgerId) {
                    data['ledger_principal'] = this.canister.ledgerId;
                }
                else {
                    this.canister.indexId = null;
                    this.actor.index = null;
                    delete data['index_principal'];
                }
            }
        }

        return data;
    }

    /**
     * Check ICRC balance
     */

    async balance() {
        try {
            const balance = await this.app.cache.ram.get({
                id: `balance.${this.wallet.account}.${this.canister.ledgerId}`,
                overdue: ONE_MINUTE,
                create: async () => {
                    return await this.actor.ledger.balance({ owner: Principal.fromText(this.wallet.principal) });
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
     * Transfer ICRC-1/2
     * @param principal: string | Principal - destination (Principal ID)
     * @param amount: Number - amount of tokens to send
     */

    async transfer({ principal, amount }) {
        if (typeof(principal) == 'string') principal = Principal.fromText(principal);

        try {
            const response = await this.actor.ledger.transfer({
                to: {
                    owner: principal,
                    subaccount: []
                },
                amount: ICP2icpt(amount, this.decimals),
                memo: memo2Binary(this.memo++)
            });
            return {'OK': response};
        }
        catch (error) {
            return {'ERROR': error};
        }

    }

    /**
     * Get transaction history
     * @param results: Number - number of results to fetch
     * @param types: Array - types of transactions to fetch or null for all
     * @return { id: {
     *     type: 'send.token' | 'recv.token' | 'aprv.token',
     *     pid: 'my principal id',
     *     to|from: { account: string },
     *     token: { canister: 'token principal id', amount: Number, fee: Number }
     * }, ...}
     */

    async transactions({ results = 100, types = null } = {}) {

        // Get from ICRC Index canister
        if (this.actor.index) {
            return await this.transactionsFromIndex({ results, types });
        }

        return {};
    }

    /**
     * Get transaction history from ICRC Index canister
     */

    async transactionsFromIndex({ results = 100, types = null } = {}) {
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

                if ('id' in record) {

                    // Get id
                    const transactionId = record.id;

                    // Get transaction
                    if (('transaction' in record) && ('kind' in record.transaction) && ('timestamp' in record.transaction)) {

                        // Get timestamp
                        const datetime = timestampNanos2ISO(record.transaction.timestamp);

                        // Transfer transaction
                        if (record.transaction.kind === 'transfer' && ('transfer' in record.transaction) && record.transaction.transfer.length) {

                            // Record
                            const transfer = record.transaction.transfer[0];

                            // Direction: 'send' | 'recv' | 'unknown'
                            const direction = transfer.from.owner.toText() === this.wallet.principal ? 'send' : transfer.to.owner.toText() === this.wallet.principal ? 'recv' : 'unknown';

                            // Transaction type filtering
                            if (types && !types.includes(`${direction}.token`)) continue;

                            // Compose data
                            const data = {
                                datetime,
                                type: `${direction}.token`,
                                token: {
                                    canister: this.canister.ledgerId,
                                    amount: Number(transfer.amount),
                                    fee: transfer.fee.length ? Number(transfer.fee[0]) : 0
                                }
                            };
                            if (direction === 'send') data.to = { principal: transfer.to.owner.toText() };
                            else if (direction === 'recv') data.from = { principal: transfer.from.owner.toText() };

                            // Save to history
                            history[`${this.canister.ledgerId}:${transactionId}`] = data;

                        }

                        // Approve transaction
                        else if (record.transaction.kind === 'approve' && ('approve' in record.transaction) && record.transaction.approve.length) {

                            // Record
                            const approve = record.transaction.approve[0];

                            // Transaction type filtering
                            if (types && !types.includes('aprv.token')) continue;

                            // Compose data
                            const data = {
                                datetime,
                                type: 'aprv.token',
                                to: { principal: approve.spender.owner.toText() },
                                token: {
                                    canister: this.canister.ledgerId,
                                    amount: Number(approve.amount),
                                    fee: approve.fee.length ? Number(approve.fee[0]) : 0
                                }
                            };

                            // Save to history
                            history[`${this.canister.ledgerId}:${transactionId}`] = data;
                        }

                    }

                }
            }
        }

        return history;
    }
    
}
