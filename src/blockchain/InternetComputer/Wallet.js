/*** ICP Wallet helpers ***/

import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/Keys.js';
import { icpLedgerBalance, icrcLedgerBalance, icpLedgerTransfer, icrcLedgerTransfer } from '/src/blockchain/InternetComputer/Ledger.js';
import { genWalletName } from '/src/utils/General.js';

/**
 * Create or update ICP wallet with ICRC tokens
 * @param args.name: string - custom wallet's name [optional]
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

            // Fill in
            icpRebuildToken(Object.assign(token, { name: 'ICP', symbol: 'ICP' }), id, wallet);

            // Bind request actions
            icpBindTokenActions(wallet.tokens[id], id);

        }

        // Token
        else {

            // Fill in
            icpRebuildToken(token, id, wallet);

            // Bind request actions
            icpBindTokenActions(wallet.tokens[id], id);
        }

        // Tag as sucessfuly rebuilded
        wallet.rebuilded = Date.now();

    }

    return wallet;
}


/**
 * Create or update single ICRC token
 */

export function icpRebuildToken(args, id, wallet) {

    // ICP Ledger ID
    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

    // Token
    wallet.tokens[id] = {
        principal: ('principal' in args) ? args.principal : wallet.principal,
        account: ('account' in args) ? args.account : wallet.account,
        name: ('name' in args) ? args.name : 'Unknown',
        symbol: ('symbol' in args) ? args.symbol : 'Unknown',
        decimals: ('decimals' in args) ? Number(args.decimals) : 8,
        fee: ('fee' in args) ? Number(args.fee) : 10000,
        balance: ('balance' in args) ? args.balance : null,
        actor: ('actor' in args) ? args.actor : id == ICP_LEDGER_CANISTER_ID ? LedgerCanister.create({ agent: wallet.agent }) : IcrcLedgerCanister.create({ agent: wallet.agent, canisterId: id }),
        request: ('request' in args) ? args.request : id == ICP_LEDGER_CANISTER_ID ?
            {
                balance: icpLedgerBalance.bind(wallet.tokens[id]),
                transfer: icpLedgerTransfer.bind(wallet.tokens[id])
            }
            :
            {
                balance: icrcLedgerBalance.bind(wallet.tokens[id]),
                transfer: icrcLedgerTransfer.bind(wallet.tokens[id])
            }
    };

    // Actor
    if (!('actor' in wallet.tokens[id]) || wallet.tokens[id].actor == null) {
        wallet.tokens[id].actor = (id == ICP_LEDGER_CANISTER_ID) ?
            LedgerCanister.create({ agent: wallet.agent })
            :
            IcrcLedgerCanister.create({ agent: wallet.agent, canisterId: id });
    }

    // Cache logo into IndexedDB if not exist
    // ...

}

export function icpBindTokenActions(scope, id) {

    // ICP Ledger ID
    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

    scope.request = (id == ICP_LEDGER_CANISTER_ID) ?
        {
            balance: icpLedgerBalance.bind(scope),
            transfer: icpLedgerTransfer.bind(scope)
        }
        :
        {
            balance: icrcLedgerBalance.bind(scope),
            transfer: icrcLedgerTransfer.bind(scope)
        };
}
