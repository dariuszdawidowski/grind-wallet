/**
 * Manages a collection of tokens.
 */

import { ICRCToken } from '/src/blockchain/InternetComputer/token-icrc.js';

export class Tokens {

    constructor({ app, wallet }) {

        // References
        this.app = app;
        this.wallet = wallet;

        // Tokens list: { canisterId: Token object, ... }
        this.list = {};

    }

    /**
     * Add token to the collection and rebuild it
     * @param {Token} token - The token object to add.
     */

    add(token) {
        this.list[token.canister.ledgerId] = token;
    }

    /**
     * Remove token from the collection
     * @param {string} ledgerId
     */

    del(ledgerId) {
        delete this.list[ledgerId];
    }

    /**
     * Get token by canister principal or get all tokens
     * @param {string} ledgerId
     * @returns {Token | Token[]}
     */

    get(ledgerId = null) {
        if (!ledgerId) return this.list;
        return this.list[ledgerId];
    }

    /**
     * Count of tokens
     * @returns {number}
     */

    count() {
        return Object.keys(this.list).length;
    }

    /**
     * Load tokens
     */

    load(serialized) {
        for (const [key, value] of Object.entries(serialized)) {
            if (!this.app.isICP(key)) {
                this.add(new ICRCToken({
                    app: this.app,
                    wallet: { principal: this.wallet.principal, account: this.wallet.account },
                    canisterId: key,
                    ...value
                }));
                this.list[key].build({ agent: this.wallet.agent });
            }
        }
    }

    /**
     * Serialize tokens for storage
     * @returns {Object}
     */

    serialize() {
        const serialized = {};
        for (const [key, token] of Object.entries(this.list)) {
            if (!this.app.isICP(key)) serialized[key] = token.serialize();
        }
        return serialized;
    }

}
