export class Token {

    constructor({ name, symbol, principal, account, balance, decimals, fee, request, actor }) {
        this.name = name;
        this.symbol = symbol;
        this.principal = principal;
        this.account = account;
        this.balance = balance;
        this.decimals = decimals;
        this.fee = fee;
        this.request = request;
        this.actor = actor;
    }

}