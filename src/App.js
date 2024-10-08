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
import { keysRecoverFromPhraseSecp256k1 } from './utils/Keys.js';
import { idlFactory as ledgerIdlFactory } from './did/ledger_canister.did.js';

/**
 * Persistent data map @ chrome.storage.local
 * 
 * version: 1 migration version
 * salt: <string> generated salt for password
 * password: <string> hash of the main password to this extension
 * wallets: {public_key: {name: string, public: string, private: encrypted string, crypto: 'ICP'}, ...}
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
            // Persistent params: crypto: 'ICP', name: string, public: string, private: encrypted string
            // Dynamic params: identity: Object, principal: string, account: string, balance: Number
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
        this.icp.agent = new HttpAgent({ host: 'https://icp-api.io' });
        this.icp.ledger.actor = Actor.createActor(ledgerIdlFactory, { agent: this.icp.agent, canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai' });

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
                        console.log('wallets', store.wallets)
                        try {
                            this.user.wallets = JSON.parse(store.wallets);
                        }
                        catch (error) {
                            this.user.wallets = {};
                        }
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
