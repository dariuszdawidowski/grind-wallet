/**
 * Manages a collection of tokens.
 */

export class Tokens {

    constructor() {

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
     * @param {Token} token 
     */

    del(token) {
        delete this.list[token.canister.ledgerId];
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
            this.list[key] = new ICRCToken(value);
            this.list[key].build();
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
            serialized[key] = token.serialize();
        }
        return serialized;
    }

}
