/**
 * Wallet implementation for Internet Computer blockchain.
 */

import { HttpAgent } from '@dfinity/agent';
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from '/src/utils/keys.js';
// import { icpLedgerBalance, icrcLedgerBalance, icpLedgerTransfer, icrcLedgerTransfer } from '/src/blockchain/InternetComputer/ledger.js';
import { Wallet } from '/src/blockchain/wallet.js';
import { ICPToken } from '/src/blockchain/InternetComputer/icp-token.js';
import { ICRCToken } from '/src/blockchain/InternetComputer/icrc-token.js';

export class ICPWallet extends Wallet {

    /**
     * Create or update ICP wallet with ICP/ICRC tokens
     */

    async build(password) {

        // Defaults
        if (!this.name) this.name = this.app.wallets.genNextWalletName('ICP');
        if (!this.blockchain) this.blockchain = 'Internet Computer';
        if (!this.tokens) this.tokens = { [this.app.ICP_LEDGER_CANISTER_ID]: {} };

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
            if (id == this.app.ICP_LEDGER_CANISTER_ID) {
                const newToken = new ICPToken(token);
                await newToken.build({ agent: this.agent, principal: this.principal, account: this.account, index: this.app.ICP_INDEX_CANISTER_ID });
                this.tokens.add(id, newToken);
            }

            // Token
            else {
                const newToken = new ICRCToken(token);
                await newToken.build({ agent: this.agent, principal: this.principal, account: this.account, index: token.index });
                this.tokens.add(id, newToken);
            }

            // Tag as sucessfuly rebuilded
            this.rebuilded = Date.now();

        }
        
    }

}

/**
 * Create or update single ICRC token
 */
/*
export function icpRebuildToken(args, id, wallet) {

    const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
    const ICP_INDEX_CANISTER_ID = 'qhbym-qaaaa-aaaaa-aaafq-cai';

    console.log('Rebuilding token:', id, args);
    // Token
    wallet.tokens[id] = {
        principal: ('principal' in args) ? args.principal : wallet.principal,
        account: ('account' in args) ? args.account : wallet.account,
        name: ('name' in args) ? args.name : 'Unknown',
        symbol: ('symbol' in args) ? args.symbol : 'Unknown',
        decimals: ('decimals' in args) ? Number(args.decimals) : 8,
        fee: ('fee' in args) ? Number(args.fee) : 10000,
        balance: ('balance' in args) ? args.balance : null,
        actor: ('actor' in args) ? args.actor : null,
        index: ('index' in args) ? args.index : null,
        // actor: ('actor' in args) ? args.actor : id == ICP_LEDGER_CANISTER_ID ? LedgerCanister.create({ agent: wallet.agent }) : IcrcLedgerCanister.create({ agent: wallet.agent, canisterId: id }),
        // index: ('index' in args) ? args.index : id == ICP_LEDGER_CANISTER_ID ? Actor.createActor(idlICPIndex, { agent: wallet.agent, canisterId: ICP_INDEX_CANISTER_ID }) : Actor.createActor(idlICRCIndex, { agent: wallet.agent, canisterId: args.index }),
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

    // Ledger Actor
    if (!('actor' in wallet.tokens[id]) || wallet.tokens[id].actor == null) {
        wallet.tokens[id].actor = (id == ICP_LEDGER_CANISTER_ID) ?
            LedgerCanister.create({ agent: wallet.agent })
            :
            IcrcLedgerCanister.create({ agent: wallet.agent, canisterId: id });
    }

    // Index Actor
    if (wallet.tokens[id].index != null) {
        // Store string id for later use
        wallet.tokens[id].indexId = wallet.tokens[id].index;
        // Create actor object instead
        wallet.tokens[id].index = (id == ICP_LEDGER_CANISTER_ID) ?
            Actor.createActor(idlICPIndex, { agent: wallet.agent, canisterId: ICP_INDEX_CANISTER_ID })
            :
            Actor.createActor(idlICRCIndex, { agent: wallet.agent, canisterId: wallet.tokens[id].indexId });
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
*/