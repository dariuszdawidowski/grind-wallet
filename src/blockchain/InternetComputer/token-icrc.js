/**
 * ICRC Token implementation
 */

import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { idlFactory as idlICRCIndex } from '/src/blockchain/InternetComputer/candid/icrc-index.did.js';
import { Token } from '/src/blockchain/token.js';
import { ICP2icpt } from '/src/utils/currency.js';
import { ONE_MINUTE, memo2Binary } from '/src/utils/general.js';

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
            const balance = await this.app.cache.get({
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

}
