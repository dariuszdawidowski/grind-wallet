/**
 * Wallet implementation for Internet Computer blockchain.
 */

import { HttpAgent } from '@icp-sdk/core/agent';
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/keys.js';
import { Wallet } from '/src/blockchain/wallet.js';
import { ICPToken } from '/src/blockchain/InternetComputer/token-icp.js';
import { ICRCToken } from '/src/blockchain/InternetComputer/token-icrc.js';

export class ICPWallet extends Wallet {

    /**
     * Create or update ICP wallet with ICP/ICRC tokens
     */

    async build(password) {

        // Canister ids
        this.ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
        this.ICP_INDEX_CANISTER_ID = 'qhbym-qaaaa-aaaaa-aaafq-cai';

        // Defaults
        if (!this.blockchain) this.blockchain = 'Internet Computer';

        // Wallet crypto symbol (for future)
        if (!this.crypto) this.crypto = 'ICP';

        // Decode keys
        const deserialized = deserializeEncryptKey(this.secret.private);
        const privateKey = await decryptKey(deserialized, password);
        const info = identityFromPrivate(privateKey);

        // Store data
        if (!this.identity) this.identity = info.identity;
        if (!this.principal) this.principal = info.principal;
        if (!this.account) this.account = info.account;

        // Agent
        if (!this.agent) {
            try {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timeout')), 10000) // 10 seconds
                );
                this.agent = await Promise.race([
                    HttpAgent.create({
                        host: 'https://icp-api.io',
                        identity: this.identity
                    }),
                    timeout
                ]);
            }
            catch (error) {
                throw new Error('Failed to connect to IC network');
            }
        }

        // Default ICP token
        const newToken = new ICPToken({
            app: this.app,
            wallet: { principal: this.principal, account: this.account }
        });
        await newToken.build({ agent: this.agent });
        this.tokens.add(newToken);

        // Build ICRC Tokens with actors
        for (const [id, token] of Object.entries(this.tokens.get())) {

            // Old token list contain also ICP token so checking it
            if (id != this.ICP_LEDGER_CANISTER_ID) {
                const newToken = new ICRCToken({ ...token, app: this.app });
                newToken.build({
                    agent: this.agent,
                });
                this.tokens.add(newToken);
            }

        }
        
    }

}
