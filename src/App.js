/**
 * Grind Wallet extension
 * (c) 2024 by Dariusz Dawidowski
 */

import './popup.css';
import { Actor, HttpAgent } from '@dfinity/agent';
import { App } from './Boost.js';
import { BottomSheet } from './widgets/BottomSheet.js';
import { PageEmpty } from './pages/account/Empty.js';
import { PageListAccounts } from './pages/account/List.js';
import { PageRegister } from './pages/user/Register.js';
import { PageLogin } from './pages/user/Login.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, decryptKey, identityFromPrivate } from './utils/Keys.js';
import { idlFactory as ledgerIdlFactory } from './did/ledger_canister.did.js';

/**
 * Persistent data map @ chrome.storage.local
 * 
 * version: 1 migration version
 * salt: <string> generated salt for password
 * password: <string> hash of the main password to this extension
 * wallets: {public_key: {name: string, public: string, private: string, crypto: 'ICP', style: string}, ...}
 */


/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {

        // Detect macOS
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            document.body.classList.add('macos');
        }

        // Bottom Sheet
        this.sheet = new BottomSheet({app: this, selector: '#bottom-sheet', hidden: true});

        // Active page
        this.current = null;

        // User credentials
        this.user = {
            password: null,
            /**
             * Persistent params: name: string, public: string, private: encrypted string, crypto: 'ICP', style: 'ICP-01'
             * Dynamic params: identity: Object, principal: string, account: string, balance: Number, agent: HttpAgent, actor: Actor
             */
            wallets: {}
        };

        // Blockchain manager
        this.icp = {
            agent: null,
            keysRecoverFromPhrase: keysRecoverFromPhraseSecp256k1,
            ledger: {
                actor: null
            }
        };

        // Check persistent data version
        const PERSISTENT_DATA_VERSION = 1;
        chrome.storage.local.get(['version'], (data) => {
            if (data.version && data.version < PERSISTENT_DATA_VERSION) {
                // Migrate in the future
            }
            else {
                chrome.storage.local.set({ version: PERSISTENT_DATA_VERSION });
            }

            // Check session
            chrome.storage.session.get(['active', 'password'], (session) => {

                // Get wallets
                chrome.storage.local.get(['wallets'], (store) => {

                    if (store.wallets) {
                        this.load('wallets', store.wallets);
                    }

                    // Continue session
                    if (session.active === true) {
                        this.user.password = session.password;
                        this.page('accounts');
                    }

                    // No active session
                    else {
                        // Check that password exists
                        chrome.storage.local.get(['salt', 'password'], (credentials) => {

                            // Login
                            if (credentials.salt && credentials.password) {
                                this.page('login', {salt: credentials.salt, hash: credentials.password});
                            }

                            // First time - create password
                            else {
                                this.page('register');
                            }
                        });
                    }

                });
            });

        });

    }

    /**
     * Clear and switch to a new page
     */

    page(name, args = {}) {

        // Clear events
        this.event.clear();

        // Remove DOM
        if (this.current) {
            this.current.destructor();
            this.current.element.remove();
        }

        // Destroy object
        this.current = null;

        // Create and attach new
        switch(name) {
            case 'register':
                this.current = new PageRegister({app: this});
                this.append(this.current);
                break;
            case 'login':
                this.current = new PageLogin({app: this, ...args});
                this.append(this.current);
                break;
            case 'accounts':
                if (Object.keys(this.user.wallets).length === 0) {
                    this.current = new PageEmpty({app: this});
                    this.append(this.current);
                }
                else {
                    this.current = new PageListAccounts({app: this});
                    this.append(this.current);
                }
                break;
        }

    }

    load(resource, data) {

        // Wallets
        if (resource == 'wallets') {

            // Deserialize
            try {
                this.user.wallets = JSON.parse(data);
            }
            catch (error) {
                this.user.wallets = {};
            }

            // Init
            this.create('wallets');
        }

    }

    create(resource) {

        // Wallets
        if (resource == 'wallets') {
            Object.values(this.user.wallets).forEach(wallet => {
                const info = identityFromPrivate(wallet.private);
                if (!('identity' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].identity = info.identity;
                if (!('principal' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].principal = info.principal;
                if (!('account' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].account = info.account;
                if (!('balance' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].balance = 0;
                if (!('agent' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].agent = new HttpAgent({
                    host: 'https://icp-api.io',
                    identity: this.user.wallets[wallet.public].identity
                });
                if (!('actor' in this.user.wallets[wallet.public])) this.user.wallets[wallet.public].actor = Actor.createActor(ledgerIdlFactory, {
                    agent: this.user.wallets[wallet.public].agent,
                    canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
                });
            });
        }

    }


    save(resource) {

        // Wallets
        if (resource == 'wallets') {
            const serializeWallets = {};
            Object.values(this.user.wallets).forEach(wallet => {
                serializeWallets[wallet.public] = {
                    name: wallet.name,
                    public: wallet.public,
                    private: wallet.private,
                    crypto: wallet.crypto,
                    style: wallet.style
                };
            });
            chrome.storage.local.set({ 'wallets': JSON.stringify(serializeWallets) });
        }
    }

}


/**
 * Global interface
 */

// window.grind = {
// };


/**
 * Start
 */

const app = new GrindWalletPlugin('#app');
