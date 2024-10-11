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
import { decryptKey, deserializeEncryptKey, identityFromPrivate } from './utils/Keys.js';
import { idlFactory as ledgerIdlFactory } from './did/ledger_canister.did.js';

/**
 * Persistent data map @ chrome.storage.local
 * 
 * version: 1 migration version
 * salt: <string> generated salt for password
 * password: <string> hash of the main password to this extension
 * wallets: {public_key: {name: string, public: string, secret: { ciphertext, iv, salt }, crypto: 'ICP', style: string}, ...}
 */


/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {

        // Detect macOS
        if (navigator.userAgent.includes('Mac')) {
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
             * Persistent params: name: string, public: string, secret: { ciphertext, iv, salt }, crypto: 'ICP', style: 'ICP-01'
             * Dynamic params: private: string, identity: Object, principal: string, account: string, balance: e8s (ICPt), agent: HttpAgent, actor: Actor
             */
            wallets: {}
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

                // Continue session
                if (session.active === true) {
                    this.user.password = session.password;
                    // Load and decode wallets
                    chrome.storage.local.get(['wallets'], (store) => {

                        if (store.wallets && Object.keys(store.wallets).length) {
                            this.load('wallets', store.wallets);
                            this.create('wallets').then(() => {
                                // Show accounts list
                                this.page('accounts');
                            });
                        }

                        // Empty accounts page
                        else {
                            this.page('accounts');
                        }

                    });
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
                this.user.wallets = data;
            }
            catch (error) {
                this.user.wallets = {};
            }

        }

    }

    async create(resource) {

        // Wallets
        if (resource == 'wallets') {
            // const wallet = this.user.wallets[Object.keys(this.user.wallets)[0]];
            for (const wallet of Object.values(this.user.wallets)) {
            // Object.values(this.user.wallets).forEach(wallet => {
                const deserialized = deserializeEncryptKey(wallet.secret);
                const privateKey = await decryptKey(deserialized, this.user.password);
                const info = identityFromPrivate(privateKey);
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
            }
            // });
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
                    secret: wallet.secret,
                    crypto: wallet.crypto,
                    style: wallet.style
                };
            });
            chrome.storage.local.set({ 'wallets': serializeWallets });
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
