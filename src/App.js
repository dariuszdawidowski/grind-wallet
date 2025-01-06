/**
 * Grind Wallet extension
 * (c) 2024-2025 by Dariusz Dawidowski
 */

import '/src/popup.css';
import { Sheet } from '/src/widgets/Sheet.js';
import { PageEmpty } from '/src/pages/account/Empty.js';
import { PageListAccounts } from '/src/pages/account/List.js';
import { PageAcceptTerms } from '/src/pages/user/Terms.js';
import { PageRegisterWebAuthn } from '/src/pages/user/RegisterWebAuthn.js';
import { PageRegisterPassword } from '/src/pages/user/RegisterPassword.js';
import { PageLogin } from '/src/pages/user/Login.js';
// import { loginBiometric } from '/src/utils/Biometric.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/ICPWallet.js';

/**
 * Main class handles the initialization and management of the Grind Wallet plugin.
 * It interacts with the Chrome storage API to persist user data and manages the user interface
 * for different states such as login, registration, and account management.
 */
class GrindWalletPlugin {

    /**
     * Constructor
     * @param {string} selector - The CSS selector for the main element of the plugin.
     */

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

        // Prevent double click in the whole app
        this.element.addEventListener('dblclick', (e) => e.preventDefault());

        /**
         * Persistent data map @ chrome.storage.local
         *
         * version: 2 migration version
         * salt: <string> generated salt for password
         * password: <string> hash of the main password to this extension
         * wallets: {public_key: {blockchain: 'Internet Computer', name: string, public: string, secret: { ciphertext, iv, salt }, style: string, tokens: {canisterId: {}, ...}}, ...}
         */
        this.PERSISTENT_DATA_VERSION = 2;

        // ICP Ledger id
        this.ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

        // Launch
        document.addEventListener('DOMContentLoaded', () => { this.init(); }, {once: true});

    }

    /**
     * Appends a component to the main element.
     * @param {Object} component - The component to append.
     */

    append(component) {
        this.element.append(component.element);
    }

    /**
     * Initializes the plugin, sets up event listeners, and loads user data from storage.
     */

    init() {

        // Detect macOS
        if (navigator.userAgent.includes('Mac')) {
            document.body.classList.add('macos');
        }

        // Bottom Sheet
        this.sheet = new Sheet({app: this, selector: '#sheet', hidden: true});

        // Active page
        this.current = null;

        // User credentials
        this.user = {
            password: null,
            // Wallets list { ICPWallet, ... }
            wallets: {}
        };

        // Get saved data
        chrome.storage.local.get(['version', 'terms', 'webauthn'], (saved) => {

            // Store data format version
            if (!('version' in saved)) {
                saved.version = this.PERSISTENT_DATA_VERSION;
                chrome.storage.local.set({ version: this.PERSISTENT_DATA_VERSION });
            }

            // TEMP
            // if (window.PublicKeyCredential) this.page('register-webauthn');
            // else this.page('register-password');
            // console.log('webauthn', JSON.parse(saved.webauthn))
            // loginBiometric(JSON.parse(saved.webauthn)).then(() => {
            //     console.log('WEBAUTHN OK');
            // });
            // return

            // Continue session
            chrome.storage.session.get(['active', 'password'], (session) => {
                if (('active' in session) && session.active === true) {
                    this.user.password = session.password;
                    // Load and decode wallets
                    chrome.storage.local.get(['wallets'], (store) => {

                        if (store.wallets && Object.keys(store.wallets).length) {
                            this.load('wallets', store.wallets, saved.version);
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

                        // First time
                        else {
                            // Accept terms of use
                            if (!saved.hasOwnProperty('terms') || saved.terms == false) {
                                this.page('terms');
                            }
                            // Create password (should be created but just in case)
                            else {
                                this.page('register-password');
                            }
                        }
                    });
                }

            });

        });

    }

    /**
     * Clears the current page and switches to a new page.
     * @param {string} name - The name of the page to switch to.
     * @param {Object} [args={}] - Additional arguments for the page.
     */

    page(name, args = {}) {

        // Remove DOM
        if (this.current) {
            this.current.element.remove();
        }

        // Destroy object
        this.current = null;

        // Create and attach new
        switch(name) {
            case 'terms':
                this.current = new PageAcceptTerms({app: this});
                this.append(this.current);
                break;
            case 'register-webauthn':
                this.current = new PageRegisterWebAuthn({app: this});
                this.append(this.current);
                break;
            case 'register-password':
                this.current = new PageRegisterPassword({app: this});
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

    /**
     * Loads a resource and assigns it to the user object.
     * @param {string} resource - The name of the resource to load.
     * @param {Object} data - The data to load.
     * @param {number} version - The version of the data.
     */

    load(resource, data, version) {

        // Wallets
        if (resource == 'wallets') {

            // Migrate
            if (version < this.PERSISTENT_DATA_VERSION) {

                // Data
                data = this.migrate(resource, data, version);

            }

            // Assign
            for (const [walletId, wallet] of Object.entries(data)) {

                // Create wallet
                this.user.wallets[walletId] = new ICPWallet({
                    blockchain: wallet.blockchain,
                    name: wallet.name,
                    publicKey: wallet.public,
                    secret: wallet.secret,
                    tokens: wallet.tokens,
                    nfts: 'nfts' in wallet ? wallet.nfts : {},
                });

            }

        }

    }

    /**
     * Migrates data to the latest version.
     * @param {string} resource - The name of the resource to migrate.
     * @param {Object} data - The data to migrate.
     * @param {number} version - The current version of the data.
     * @returns {Object} - The migrated data.
     */

    migrate(resource, data, version) {

        // Wallets
        if (resource == 'wallets') {

            // v1 -> v2
            if (version == 1) {

                // Migrate wallets
                for (const [id, wallet] of Object.entries(data)) {

                    // crypto: 'ICP' -> blockchain: 'Internet Computer'
                    delete data[id].crypto;
                    data[id].blockchain = 'Internet Computer';

                    // Get rid of style
                    delete data[id].style;

                    // ICP token
                    data[id]['tokens'] = {};
                    data[id]['tokens'][this.ICP_LEDGER_CANISTER_ID] = {};

                }

                // Save new version
                this.save('wallets', data);
                chrome.storage.local.set({ version: 2 });

            }

            // Return data
            return data;

        }

    }

    /**
     * Creates resources based on the user data.
     * @param {string} resource - The name of the resource to create.
     * @returns {Promise<void>}
     */

    async create(resource) {

        // Wallets
        if (resource == 'wallets') {
            for (const wallet of Object.values(this.user.wallets)) {
                try {
                    await wallet.rebuild(this.user.password);
                }
                catch (error) {
                    console.error(error);
                    alert(error);
                }
            }
        }

    }

    /**
     * Saves a resource to Chrome storage.
     * @param {string} resource - The name of the resource to save.
     * @param {Object} data - The data to save.
     */

    save(resource, data) {

        // Wallets
        if (resource == 'wallets') {
            const serializeWallets = {};
            Object.values(data).forEach(wallet => {
                serializeWallets[wallet.public] = wallet.serialize();
            });
            chrome.storage.local.set({ 'wallets': serializeWallets });
        }

    }

}

/**
 * Global interface
 */

// window.ic.grind = {
// };

/**
 * Start
 */

const app = new GrindWalletPlugin('#app');
