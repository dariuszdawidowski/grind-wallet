/**
 * Manages a collection of tokens.
 */

export class Tokens {

    constructor(tokens = {}) {

        // Tokens list: { canisterId: Token object, ... }
        this.list = tokens;

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
                    index: value.indexId ? value.indexId : null
                }
            ])
        );
    }

}
