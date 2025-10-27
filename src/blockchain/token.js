export class Token {

    constructor({ wallet, canisterId, indexId, name, symbol, decimals, fee }) {

        /*** Persistent attributes ***/

        this.canister = Object.freeze({
            // Token Canister ID: string
            ledgerId: canisterId,
            // Token Index Canister ID: string (optional)
            indexId: indexId
        });

        // Token name: string
        this.name = name || 'Unknown';

        // Token symbol: string
        this.symbol = symbol || 'Unknown';

        // Token decimals: int
        this.decimals = decimals || 8;

        // Token fee: int
        this.fee = fee || 10000;

        /*** Dynamic attributes ***/

        // Wallet
        this.wallet = Object.freeze({
            principal: wallet.principal,
            account: wallet.account
        });

        // Token actors
        this.actor = {
            ledger: null,
            index: null
        };

        // Memo counter
        this.memo = 0;

        // Builded flag
        this.ready = false;

        // Cache timestamp
        this._cache = {
            balance: null,
            balanceTimestamp: 0
        };

    }

    /**
     * Get token balance from cache or return false
     */

    cache(property, value = null) {
        if (value !== null) {
            this._cache[property] = value;
            this._cache[`${property}Timestamp`] = Date.now();
        }
        if (this._cache[property] && (Date.now() - this._cache[`${property}Timestamp`]) < 60000) { // 1 minute cache
            return this._cache[property];
        }
        return false;
    }

    /**
     * Serializes the token instance to a plain object.
     */

    serialize() {
        return {
            index: this.canister.indexId,
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals,
            fee: this.fee
        };
    }

}