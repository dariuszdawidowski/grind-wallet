export class Token {

    constructor({ name, symbol, decimals, fee }) {

        /*** Persistent attributes ***/

        // Token name: string
        this.name = name;

        // Token symbol: string
        this.symbol = symbol;

        // Token decimals: int
        this.decimals = decimals;

        // Token fee: int
        this.fee = fee;

        /*** Dynamic attributes ***/

        // Token Principal ID: string
        this.principal = null;

        // Token Account ID: string
        this.account = null;

        // Token balance: BigInt
        this.balance = 0;

        // Token actor: object Actor
        this.actor = null;

        // Token request: object { functions }
        this.request = {};

    }

}