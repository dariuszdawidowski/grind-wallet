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

    }

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