/**
 * ICP Token implementation
 */

import { Actor } from '@dfinity/agent';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { idlFactory as idlICPIndex } from '/src/blockchain/InternetComputer/candid/icp-index.did.js';
import { Token } from '/src/blockchain/token.js';
import { ONE_SECOND } from '/src/utils/general.js';

export class ICPToken extends Token {

    constructor({ cache, wallet }) {
        super({
            cache,
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
            const balance = await this.cache.get({
                id: `balance.${this.wallet.account}.${this.canister.indexId}`,
                overdue: ONE_SECOND * 10,
                create: async () => {
                    return await this.actor.ledger.accountBalance({ accountIdentifier: this.wallet.account });
                }
            });
            return balance;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    /**
     * Transfer ICP
     * @param args.account: string | Uint8Array - destination (Account ID)
     * @param args.amount: Number - amount of tokens to send
     */

    async transfer(args) {

        if (typeof(args.account) == 'string') args.account = hexStringToUint8Array(args.account);

        try {
            const response = await this.actor.ledger.transfer({
                to: args.account,
                amount: ICP2icpt(args.amount, this.decimals),
                memo: this.memo++
            });
            return {'OK': response};
        }
        catch (error) {
            return {'ERROR': error};
        }
    }

}

