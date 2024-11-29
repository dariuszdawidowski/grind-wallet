/*** ICP Wallet helpers ***/

import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/Keys.js';
import { icpLedgerBalance, icrcLedgerBalance, icpLedgerTransfer, icrcLedgerTransfer } from '/src/blockchain/InternetComputer/Ledger.js';
import { genWalletName } from '/src/utils/General.js';

/**
 * Create or update ICP/ICRC wallet
 * @param args.name: string - custom wallet's name
 * @param args.public: string - public key
 * @param args.secret: { ciphertext, iv, salt } - encoded private key
 * @returns:
 * { identity: Object, principal: string, account: string, agent: HttpAgent, tokens: {canisterId: {actor: Actor, balance: e8s (ICPt)}, ...} }
 */

export async function icpRebuildWallet(args, password) {

    // Validate
    if (!('public' in args) || !('secret' in args)) return null;
    if (!('ciphertext' in args.secret) || !('iv' in args.secret) || !('salt' in args.secret)) return null;

    // ICP Ledger ID
    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

    const wallet = {
        name: ('name' in args) ? args.name : genWalletName(this.app.user.wallets, 'ICP'),
        blockchain: ('blockchain' in args) ? args.blockchain : 'Internet Computer',
        public: args.public,
        secret: args.secret,
        identity: ('identity' in args) ? args.identity : null,
        principal: ('principal' in args) ? args.principal : null,
        account: ('account' in args) ? args.account : null,
        agent: ('agent' in args) ? args.agent : null,
        tokens: ('tokens' in args) ? args.tokens : {'ryjl3-tyaaa-aaaaa-aaaba-cai': {}}
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

            // Copy Prinncipal ID and Account ID
            if (!('principal' in wallet.tokens[id])) wallet.tokens[id].principal = wallet.principal;
            if (!('account' in wallet.tokens[id])) wallet.tokens[id].account = wallet.account;

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

            // Name
            if (!('name' in wallet.tokens[id])) {
                wallet.tokens[id].name = 'ICP';
            }

            // Symbol
            if (!('symbol' in wallet.tokens[id])) {
                wallet.tokens[id].symbol = 'ICP';
            }

            // Decimals
            if (!('decimals' in wallet.tokens[id])) {
                wallet.tokens[id].decimals = 8;
            }

            // Fee
            if (!('fee' in wallet.tokens[id])) {
                wallet.tokens[id].fee = 10000;
            }

            // Request actions
            if (!('request' in wallet.tokens[id])) {
                wallet.tokens[id].request = {
                    // metadata: icpLedgerMetadata.bind(wallet.tokens[id]),
                    balance: icpLedgerBalance.bind(wallet.tokens[id]),
                    transfer: icpLedgerTransfer.bind(wallet.tokens[id])
                };
            }
        }

        // Token
        else {

            // Copy Prinncipal ID and Account ID
            if (!('principal' in wallet.tokens[id])) wallet.tokens[id].principal = wallet.principal;
            if (!('account' in wallet.tokens[id])) wallet.tokens[id].account = wallet.account;

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

            // Name
            if (!('name' in wallet.tokens[id])) {
                wallet.tokens[id].name = 'Ratex';
            }

            // Symbol
            if (!('symbol' in wallet.tokens[id])) {
                wallet.tokens[id].symbol = 'RTX';
            }

            // Decimals
            if (!('decimals' in wallet.tokens[id])) {
                wallet.tokens[id].decimals = 8;
            }

            // Fee
            if (!('fee' in wallet.tokens[id])) {
                wallet.tokens[id].fee = 10000;
            }

            // Cache logo into IndexedDB if not exist

            // Request actions
            if (!('request' in wallet.tokens[id])) {
                wallet.tokens[id].request = {
                    // metadata: icpLedgerMetadata.bind(wallet.tokens[id]),
                    balance: icrcLedgerBalance.bind(wallet.tokens[id]),
                    transfer: icrcLedgerTransfer.bind(wallet.tokens[id])
                };
            }
        }

        // Tag as sucessfuly rebuilded
        wallet.rebuilded = Date.now();

    }

    return wallet;
}
