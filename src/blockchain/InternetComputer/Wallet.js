/*** ICP Wallet helpers ***/

import { Actor, HttpAgent } from '@dfinity/agent';
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/Keys.js';
import { idlFactory as ledgerIdlFactory } from '/src/blockchain/InternetComputer/ledger_canister.did.js';

/**
 * Create functional ICP/ICRC wallet
 * @param args.public: string - public key
 * @param args.secret: { ciphertext, iv, salt } - encoded private key
 * @returns:
 * { identity: Object, principal: string, account: string, agent: HttpAgent, tokens: {canisterId: {actor: Actor, balance: e8s (ICPt)}, ...} }
 */

export async function createWallet(args, password) {

    // ICP Ledger id
    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

    // console.log('createWallet', args, password)

    const wallet = {
        identity: null,
        principal: null,
        account: null,
        agent: null,
        tokens: {}
    };

    // Decode keys
    const deserialized = deserializeEncryptKey(args.secret);
    const privateKey = await decryptKey(deserialized, password);
    const info = identityFromPrivate(privateKey);

    // Store data
    wallet.identity = info.identity;
    wallet.principal = info.principal;
    wallet.account = info.account;

    // Agent
    wallet.agent = new HttpAgent({
        host: 'https://icp-api.io',
        identity: wallet.identity
    });

    // Tokens with actors
    for (const [id, token] of Object.entries(args.tokens)) {

        // ICP
        if (id == ICP_LEDGER_CANISTER_ID) {
            wallet.tokens[id] = {
                actor: Actor.createActor(ledgerIdlFactory, {
                    agent: wallet.agent,
                    canisterId: ICP_LEDGER_CANISTER_ID
                }),
                balance: null
            };
        }

        // Token
        else {

        }

    }

    return wallet;
}
