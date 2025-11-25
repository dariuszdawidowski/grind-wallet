/**
 * Manages a collection of wallets.
 */

import { ICPWallet } from '/src/blockchain/InternetComputer/wallet-icp.js';

export class Wallets {

    constructor({ app }) {
        // References
        this.app = app;

        // Wallets list: { publicKey: Wallet object, ... }
        this.list = {};
    }

    /**
     * Add wallet to the collection and rebuild it
     * @param {Wallet} wallet - The wallet object to add.
     */

    add(wallet) {
        this.list[wallet.public] = wallet;
    }

    /**
     * Remove wallet from the collection
     * @param {string} publicKey 
     */

    del(publicKey) {
        delete this.list[publicKey];
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
     * Get wallet by principal ID
     * @param {string} principal 
     * @returns {Wallet | null}
     */

    getByPrincipal(principal) {
        return Object.values(this.list).find(wallet => wallet.principal === principal) || null;
    }

    /**
     * Get wallet by account ID
     * @param {string} account
     * @returns {Wallet | null}
     */

    getByAccount(account) {
        return Object.values(this.list).find(wallet => wallet.account === account) || null;
    }

    /**
     * Get wallet by principal ID or account ID
     * @param {string} principal 
     * @param {string} account
     * @returns {Wallet | null}
     */

    getByPrincipalOrAccount(principal, account) {
        return Object.values(this.list).find(wallet => wallet.principal === principal || wallet.account === account) || null;
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

    /**
     * Check if there is a wallet in the collection.
     * @returns {boolean}
     */

    hasWallet(principal) {
        return Object.values(this.list).some(wallet => wallet.principal === principal);
    }

    /**
     * Check if there is a similar wallet by principal ID in the collection.
     * @returns {boolean}
     */

    hasSimilarPrincipal(principal) {
        return Object.values(this.list).some(wallet => wallet.principal.startsWith(principal.slice(0, 4)));
    }

    /**
     * Check if there is a similar wallet by principal ID in the collection.
     * @returns {boolean}
     */

    hasSimilarAccount(account) {
        return Object.values(this.list).some(wallet => wallet.account.startsWith(account.slice(0, 4)));
    }

    /**
     * Load wallets from persistent storage
     */

    async load() {
        const storageLocal = await chrome.storage.local.get('wallets');
        // Load Wallets
        if (storageLocal.wallets) {
            for (const [_, w] of Object.entries(storageLocal.wallets)) {
                // Migrate wallet data
                const walletData = this.migrate(w);
                // Create wallet
                const newWallet = new ICPWallet({
                    app: this.app,
                    blockchain: walletData.blockchain,
                    name: walletData.name,
                    publicKey: walletData.public,
                    secret: walletData.secret
                });
                await newWallet.build(this.app.user.password);
                this.add(newWallet);
                // Load tokens
                if (Object.keys(walletData.tokens).length) newWallet.tokens.load(walletData.tokens);
                // Load NFTs
                if (Object.keys(walletData.nfts).length) newWallet.nfts.load(walletData.nfts);
            }
        }
    }

    /**
     * Migrate wallet data to the latest version
     * @param {Object} wallet 
     * @returns {Object} migrated wallet
     */

    migrate(wallet) {

        // blockchain: 'Internet Computer'
        if (!('blockchain' in wallet)) {
            wallet.blockchain = 'Internet Computer';
        }

        return wallet;
    }

    /**
     * Save wallets to persistent storage
     */

    async save() {
        const serializedWallets = {};
        Object.values(this.list).forEach(wallet => {
            serializedWallets[wallet.public] = wallet.serialize();
        });
        await chrome.storage.local.set({ 'wallets': serializedWallets });
    }

}
