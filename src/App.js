/**
 * Grind Wallet extension
 * (c) 2024 by Dariusz Dawidowski
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
import { icpRebuildWallet } from '/src/blockchain/InternetComputer/Wallet.js';


/**
 * Main class
 */

class GrindWalletPlugin {

    constructor(selector) {

        // Main element
        this.element = document.querySelector(selector);

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

    append(component) {
        this.element.append(component.element);
    }

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
            /**
             * Persistent params: blockchain: 'Internet Computer', name: string, public: string, secret: { ciphertext, iv, salt }, tokens: {canisterId: {}}
             * Dynamic params: identity: Object, principal: string, account: string, agent: HttpAgent, tokens: {canisterId: {actor: Actor, balance: ICPt/e8s}}
             */
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
     * Clear and switch to a new page
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

    load(resource, data, version) {

        // Wallets
        if (resource == 'wallets') {

            // Migrate
            if (version < this.PERSISTENT_DATA_VERSION) {

                // Data
                data = this.migrate(resource, data, version);

            }

            // Assign
            this.user.wallets = data;

        }

    }

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

    async create(resource) {

        // Wallets
        if (resource == 'wallets') {
            for (const walletData of Object.values(this.user.wallets)) {
                const wallet = await icpRebuildWallet(walletData, this.user.password);
                Object.assign(this.user.wallets[walletData.public], wallet);
            }
        }

    }

    save(resource, data) {

        // Wallets
        if (resource == 'wallets') {
            const serializeWallets = {};
            Object.values(data).forEach(wallet => {
                serializeWallets[wallet.public] = {
                    blockchain: wallet.blockchain,
                    name: wallet.name,
                    public: wallet.public,
                    secret: wallet.secret,
                    tokens: Object.fromEntries(
                        Object.entries(wallet.tokens).map(([key, value]) => [
                            key,
                            { name: value.name, symbol: value.symbol, decimals: value.decimals, fee: value.fee }
                        ])
                    )
                };
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
