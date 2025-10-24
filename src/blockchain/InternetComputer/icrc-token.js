/**
 * ICRC Token implementation
 */

import { Actor } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { idlFactory as idlICRCIndex } from '/src/blockchain/InternetComputer/candid/icrc-index.did.js';
import { Token } from '/src/blockchain/token.js';

export class ICRCToken extends Token {

    /**
     * Rebuild ICRC token with actors
     */

    build({ agent, principal, index }) {

        // Params
        this.principal = principal;
        this.account = account;

        // Ledger Actor
        this.actor.ledger = IcrcLedgerCanister.create({ agent, canisterId: this.principal });

        // Index Actor
        this.actor.index = Actor.createActor(idlICRCIndex, { agent, canisterId: index });

    }

    /**
     * Check ICRC balance
     */

    async balance() {
        try {
            return await this.actor.ledger.balance({ owner: Principal.fromText(this.principal) });
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
