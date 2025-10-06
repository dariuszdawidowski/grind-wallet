/**
 * API for developers
 */

import { Principal } from '@dfinity/principal';

export class API {

    constructor() {
        this.isWalletLocked = true; // Wallet lock status
        this.principalId = null; // User principal ID
        this.accountId = null; // User account ID for ICP Ledger
        this._connected = false; // Connection status
    }

    /**
     * Request connection to Grind Wallet plugin and create agent
     * @param whitelist: ['Canister ID', ...] - Will ask user for permission to connect to these canisters
     * @param host: string URL - Optional ICP host for local development (default is https://icp0.io)
     * @param timeout: Number in ms - connection timeout (default 5000)
     * @return publicKey: ArrayBuffer - Public key of the user
     */

    async requestConnect(args) {
        const safeWallet = await this._openPopupAndGetWallet();
        if (safeWallet) {
            this.isWalletLocked = false;
            this.principalId = safeWallet.principalId;
            this.accountId = safeWallet.accountId;
            this._connected = true;
            //return safeWallet.publicKey;
        }
        return null;
    }

    /**
     * Check if Grind Wallet plugin is connected
     * @return boolean - true if connected, false otherwise
     */

    async isConnected() {
        return this._connected;
    }

    /**
     * Disconnect from Grind Wallet plugin
     */

    async disconnect() {
        this.principalId = null;
        this.accountId = null;
        this._connected = false;
    }

    /**
     * Create actor for canister
     * @param interfaceFactory: IDL - Interface factory from canister .did file
     * @param canisterId: string - Canister ID
     * @return actor - Actor for canister
     */

    async createActor(args) {
    }

    /**
     * Get principal of the user
     * @return principal - Principal of the user
     */

    getPrincipal() {
        if (!this.principalId) throw new Error('Wallet not connected');
        return Principal.fromText(this.principalId);
    }

    /**
     * Get balance of the user for ICP Ledger
     * @param canisterId: string - Canister ID of ICP Ledger (default: 'ryjl3-tyaaa-aaaaa-aaaba-cai')
     * @return balance - Balance in e8s (1 ICP = 100,000,000 e8s)
     */

    async getBalance(args) {
        return 0;
    }

    /**
     * Request transfer of ICP tokens to another account
     * @param to: string - Account Identifier or Principal of the recipient
     * @param amount: number - Amount in e8s (1 ICP = 100,000,000 e8s)
     * @param fee: number - Optional fee in e8s (default 10,000 e8s)
     * @param memo: number - Optional memo (default 0)
     * @param canisterId: string - Canister ID of ICP Ledger (default: 'ryjl3-tyaaa-aaaaa-aaaba-cai')
     * @return blockHeight - Block height of the transaction
     */

    async requestTransfer(args) {
        return null;
    }

    /**
     * Send message to background worker to open Grind Wallet popup
     */

    async _openPopupAndGetWallet() {
        return new Promise((resolve, reject) => {
            const handler = (event) => {
                if (event.source !== window) return;
                if (event.data?.type === 'GW_WALLET') {
                    window.removeEventListener('message', handler);
                    resolve(event.data.payload);
                } else if (event.data?.type === 'GW_WALLET_ERROR') {
                    window.removeEventListener('message', handler);
                    reject(new Error(event.data.reason));
                }
            };
            window.addEventListener('message', handler);
            window.postMessage({ type: 'GW_OPEN_POPUP' }, '*');
        });
    }

}
