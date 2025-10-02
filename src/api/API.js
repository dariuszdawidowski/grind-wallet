/**
 * API for developers
 */

export class API {

    constructor() {

        this.agent = null; // ICP's HttpAgent reference
        this.isWalletLocked = true; // Wallet lock status
        this.principalId = null; // User principal ID
        this.accountId = null; // User account ID for ICP Ledger

    }

    /**
     * Request connection to Grind Wallet plugin and create agent
     * @param whitelist: ['Canister ID', ...] - Will ask user for permission to connect to these canisters
     * @param host: string URL - Optional ICP host for local development (default is https://icp0.io)
     * @param timeout: Number in ms - connection timeout (default 5000)
     * @return publicKey: ArrayBuffer - Public key of the user
     */

    async requestConnect(args) {
        console.log('API.requestConnect', args);

    }

    /**
     * Check if Grind Wallet plugin is connected
     * @return boolean - true if connected, false otherwise
     */

    async isConnected() {
        return false;
    }

    /**
     * Disconnect from Grind Wallet plugin
     */
    async disconnect() {
        console.log('API.disconnect');
    }

    /**
     * Create actor for canister
     * @param interfaceFactory: IDL - Interface factory from canister .did file
     * @param canisterId: string - Canister ID
     * @return actor - Actor for canister
     */
    async createActor(args) {
        console.log('API.createActor', args);
    }

    /**
     * Get principal of the user
     * @return principal - Principal of the user
     */
    async getPrincipal() {
        console.log('API.getPrincipal');
        return null;
    }

    /**
     * Get balance of the user for ICP Ledger
     * @param canisterId: string - Canister ID of ICP Ledger (default: 'ryjl3-tyaaa-aaaaa-aaaba-cai')
     * @return balance - Balance in e8s (1 ICP = 100,000,000 e8s)
     */
    async getBalance(args) {
        console.log('API.getBalance', args);
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
        console.log('API.requestTransfer', args);
        return null;
    }

}
