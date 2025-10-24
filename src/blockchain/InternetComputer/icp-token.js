/**
 * ICP Token implementation
 */

import { Actor } from '@dfinity/agent';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { idlFactory as idlICPIndex } from '/src/blockchain/InternetComputer/candid/icp-index.did.js';
import { Token } from '/src/blockchain/token.js';

export class ICPToken extends Token {

    constructor() {
        super({
            principal: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            name: 'Internet Computer Protocol',
            symbol: 'ICP',
            decimals: 8,
            fee: 10000,
            index: 'qhbym-qaaaa-aaaaa-aaafq-cai'
        });
    }

    /**
     * Rebuild ICP token with actor
     */

    build({ agent }) {

        // Ledger Actor
        this.actor = LedgerCanister.create({ agent });

        // Index Actor
        this.index = Actor.createActor(idlICPIndex, { agent, canisterId: this.index });

    }

    /**
     * Check ICP balance
     */

    async balance() {

        try {
            return await this.actor.accountBalance({ accountIdentifier: this.account });
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
            const response = await this.actor.transfer({
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

