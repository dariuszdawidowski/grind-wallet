export class Token {

    constructor({ name, symbol, decimals, fee, index }) {

        /*** Persistent attributes ***/

        // Token name: string
        this.name = name || 'Unknown';

        // Token symbol: string
        this.symbol = symbol || 'Unknown';

        // Token decimals: int
        this.decimals = decimals || 8;

        // Token fee: int
        this.fee = fee || 10000;

        // Index canister ID: string
        this.index = index;

        /*** Dynamic attributes ***/

        // Token Principal ID: string
        this.principal = null;

        // Token Account ID: string
        this.account = null;

        // Token balance: BigInt
        this.balance = 0;

        // Token actor: object Actor
        this.actor = null;

        // Memo counter
        this.memo = 0;

        // Token request: object { functions }
        this.request = {};

        // Rebuilded indicator: int timestamp
        this.rebuilded = null;

    }

}