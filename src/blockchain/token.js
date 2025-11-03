/**
 * Token abstract class
 */

export class Token {

    constructor({ app, wallet, canisterId, indexId, name, symbol, decimals, fee }) {

        // References
        this.app = app;

        /*** Persistent attributes ***/

        this.canister = {
            // Token Canister ID: string
            ledgerId: canisterId,
            // Token Index Canister ID: string (optional)
            indexId: indexId
        };

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

        // Validated flag
        this.valid = false;

        // Builded flag
        this.ready = false;

    }

    /**
     * Serializes the token instance to a plain object.
     */

    serialize() {
        const data = {
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals,
            fee: this.fee
        };
        if (this.canister.indexId) data['indexId'] = this.canister.indexId;
        return data;
    }

}