/**
 * ICP Token implementation
 */

import { Actor } from '@dfinity/agent';
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

}

