export class Token {

    constructor({ principal, name, symbol, decimals, fee, index }) {

        /*** Persistent attributes ***/

        // Token Canister ID: string
        this.principal = principal;

        // Index canister ID: string
        this.index = index;

        // Token name: string
        this.name = name || 'Unknown';

        // Token symbol: string
        this.symbol = symbol || 'Unknown';

        // Token decimals: int
        this.decimals = decimals || 8;

        // Token fee: int
        this.fee = fee || 10000;

        /*** Dynamic attributes ***/

        // Token actors
        this.actor = {
            ledger: null,
            index: null
        };

        // Memo counter
        this.memo = 0;

    }

}