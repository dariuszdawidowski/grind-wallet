/**
 * Manages a collection of tokens.
 */

export class Tokens {

    constructor() {

        // Tokens list: { canisterId: Token object, ... }
        this.list = {};

        // List proxy to access tokens directly by their canister IDs
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return target.list[prop];
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                } else {
                    target.list[prop] = value;
                }
                return true;
            }
        });

    }

    /**
     * Add token to the collection and rebuild it
     * @param {Token} token - The token object to add.
     */

    add(token) {
        this.list[token.principal] = token;
    }

    /**
     * Remove token from the collection
     * @param {Token} token 
     */

    del(token) {
        delete this.list[token.principal];
    }

    /**
     * Get token by public principal or get all tokens
     * @param {string} publicKey 
     * @returns {Token | Token[]}
     */

    get(principal = null) {
        if (!principal) return this.list;
        return this.list[principal];
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
        return Object.fromEntries(
            Object.entries(this.list).map(([key, value]) => [
                key,
                {
                    name: value.name,
                    symbol: value.symbol,
                    decimals: value.decimals,
                    fee: value.fee,
                    index: value.index
                }
            ])
        );
    }

}
