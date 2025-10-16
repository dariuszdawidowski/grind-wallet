/*** ICP Wallet helpers ***/

import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/Keys.js';
import { icpLedgerBalance, icrcLedgerBalance, icpLedgerTransfer, icrcLedgerTransfer } from '/src/blockchain/InternetComputer/Ledger.js';
import { genWalletName } from '/src/utils/General.js';
import { Wallet } from '/src/blockchain/Wallet.js';
import { ICPToken } from '/src/blockchain/InternetComputer/ICPToken.js';
import { ICRCToken } from '/src/blockchain/InternetComputer/ICRCToken.js';

export class ICPWallet extends Wallet {

    /**
     * Create or update ICP wallet with ICP/ICRC tokens
     */

    async rebuild(password) {

        // ICP Ledger ID
        const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

        // Defaults
        if (!this.name) this.name = genWalletName(this.app.wallets, 'ICP');
        if (!this.blockchain) this.blockchain = 'Internet Computer';
        if (!this.tokens) this.tokens = {'ryjl3-tyaaa-aaaaa-aaaba-cai': {}};

        // Wallet crypto symbol (for future)
        if (!this.crypto) this.crypto = 'ICP';

        // Decode keys
        const deserialized = deserializeEncryptKey(this.secret);
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

        // Tokens with actors
        for (const [id, token] of Object.entries(this.tokens)) {

            // ICP
            if (id == ICP_LEDGER_CANISTER_ID) {

                // Fill in
                icpRebuildToken(Object.assign(token, { name: 'ICP', symbol: 'ICP' }), id, this);

                // Bind request actions
                icpBindTokenActions(this.tokens[id], id);

            }

            // Token
            else {

                // Fill in
                icpRebuildToken(token, id, this);

                // Bind request actions
                icpBindTokenActions(this.tokens[id], id);
            }

            // Tag as sucessfuly rebuilded
            this.rebuilded = Date.now();

        }
        
    }

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
