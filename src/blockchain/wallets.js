/**
 * Manages a collection of wallets.
 */

export class Wallets {

    constructor() {

        // Wallets list: { publicKey: Wallet object, ... }
        this.list = {};

        // List proxy to access wallets directly by their public keys
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
     * Add wallet to the collection
     * @param {Wallet} wallet - The wallet object to add.
     */

    add(wallet) {
        this.list[wallet.public] = wallet;
    }

    /**
     * Remove wallet from the collection
     * @param {Wallet} wallet 
     */

    del(wallet) {
        delete this.list[wallet.public];
    }

    /**
     * Get wallet by public key or get all wallets
     * @param {string} publicKey 
     * @returns {Wallet | Wallet[]}
     */

    get(publicKey = null) {
        if (!publicKey) return Object.values(this.list);
        return this.list[publicKey];
    }

    /**
     * Count of wallets
     * @returns {number}
     */

    count() {
        return Object.keys(this.list).length;
    }

    /**
     * Generate a wallet name based on the number of existing wallets and the specified cryptocurrency.
     *
     * @param {string} crypto - The blockchain or cryptocurrency type.
     * @returns {string} The generated wallet name.
     */

    genNextWalletName(crypto) {
        return `${crypto} #${this.count() + 1}`;
    }

}
