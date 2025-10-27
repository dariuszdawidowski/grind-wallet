/**
 * Manages a collection of tokens.
 */

export class Tokens {

    constructor({ app }) {

        // References
        this.app = app;

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
        console.log('Loading tokens:', serialized);
        for (const [key, value] of Object.entries(serialized)) {
            if (!this.app.isICPLedger(key)) {
                this.list[key] = new ICRCToken({ ...value, cache: this.app.cache });
                this.list[key].build();
            }
        }
    }

    /**
     * Serialize tokens for storage
     * @returns {Object}
     */

    serialize() {
        if (Object.keys(this.list).length === 0) return {};
        const serialized = {};
        for (const [key, token] of Object.entries(this.list)) {
            if (!this.app.isICPLedger(key)) serialized[key] = token.serialize();
        }
        return serialized;
    }

}
