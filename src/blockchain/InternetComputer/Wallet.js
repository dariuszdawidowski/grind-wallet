/*** ICP Wallet helpers ***/

import { Actor, HttpAgent } from '@dfinity/agent';
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/Keys.js';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";

/**
 * Create or update ICP/ICRC wallet
 * @param args.public: string - public key
 * @param args.secret: { ciphertext, iv, salt } - encoded private key
 * @returns:
 * { identity: Object, principal: string, account: string, agent: HttpAgent, tokens: {canisterId: {actor: Actor, balance: e8s (ICPt)}, ...} }
 */

export async function rebuildWallet(args, password) {

    // ICP Ledger id
    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

    const wallet = {
        identity: ('identity' in args) ? args.identity : null,
        principal: ('principal' in args) ? args.principal : null,
        account: ('account' in args) ? args.account : null,
        agent: ('agent' in args) ? args.agent : null,
        tokens: ('tokens' in args) ? args.tokens : {}
    };

    // Decode keys
    const deserialized = deserializeEncryptKey(args.secret);
    const privateKey = await decryptKey(deserialized, password);
    const info = identityFromPrivate(privateKey);

    // Store data
    if (!wallet.identity) wallet.identity = info.identity;
    if (!wallet.principal) wallet.principal = info.principal;
    if (!wallet.account) wallet.account = info.account;

    // Agent
    if (!wallet.agent) wallet.agent = await HttpAgent.create({
        host: 'https://icp-api.io',
        identity: wallet.identity
    });

    // Tokens with actors
    for (const [id, token] of Object.entries(wallet.tokens)) {

        // ICP
        if (id == ICP_LEDGER_CANISTER_ID) {

            // Actor
            if (!('actor' in wallet.tokens[id]) || wallet.tokens[id].actor == null) {
                wallet.tokens[id].actor = LedgerCanister.create({
                    agent: wallet.agent
                });
            }

            // Balance
            if (!('balance' in wallet.tokens[id])) {
                wallet.tokens[id].balance = null;
            }
        }

        // Token
        else {

            // Actor
            if (!('actor' in wallet.tokens[id]) || wallet.tokens[id].actor == null) {
                wallet.tokens[id].actor = IcrcLedgerCanister.create({
                    agent: wallet.agent,
                    canisterId: id,
                });
            }

            // Balance
            if (!('balance' in wallet.tokens[id])) {
                wallet.tokens[id].balance = null;
            }

            // Fetch metadata

            // Name

            // Symbol

            // Decimals

            // Fee

            // Cache logo into IndexedDB if not exist
        }

    }

    return wallet;
}
