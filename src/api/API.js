/**
 * API for developers
 */

export class API {

    constructor() {

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

}
