/**
 * ICRC Token implementation
 */

import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { idlFactory as idlICRCIndex } from '/src/blockchain/InternetComputer/candid/icrc-index.did.js';
import { Token } from '/src/blockchain/token.js';
import { ICP2icpt } from '/src/utils/currency.js';

export class ICRCToken extends Token {

    /**
     * Rebuild ICRC token with actors
     */

    build({ agent }) {
        // Ledger Actor
        this.actor.ledger = IcrcLedgerCanister.create({ agent, canisterId: this.canister.ledgerId });

        // Index Actor
        if (this.canister.indexId) this.actor.index = Actor.createActor(idlICRCIndex, { agent, canisterId: this.canister.indexId });

        // Set ready flag
        this.ready = true;
    }

    /**
     * Check ICRC balance
     */

    async balance() {
        try {
            return await this.actor.ledger.balance({ owner: Principal.fromText(this.wallet.principal) });
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }

    /**
     * Transfer ICRC-1/2
     * @param args.principal: string | Principal - destination (Principal ID)
     * @param args.amount: Number - amount of tokens to send
     */

    async transfer(args) {
        if (('principal' in args) && typeof(args.principal) == 'string') args.principal = Principal.fromText(args.principal);

        try {
            const response = await this.actor.ledger.transfer({
                to: {
                owner: args.principal,
                subaccount: []
                },
                amount: ICP2icpt(args.amount, this.decimals),
                memo: memo2Binary(this.memo++)
            });
            return {'OK': response};
        }
        catch (error) {
            return {'ERROR': error};
        }

    }

}
