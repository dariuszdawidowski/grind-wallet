/**
 * Grind Wallet extension
 * (c) 2024-2025 by Dariusz Dawidowski
 */

import '/src/chrome-extension/popup/popup.css';
import { LogSystem } from '/src/utils/logger.js';
import { Sheet } from '/src/chrome-extension/popup/widgets/sheet.js';
import { PageAccounts } from '/src/chrome-extension/popup/pages/accounts/index.js';
import { PageAcceptTerms } from '/src/chrome-extension/popup/pages/onboarding/terms.js';
import { PageRegisterPassword } from '/src/chrome-extension/popup/pages/onboarding/register-password.js';
import { PageLogin } from '/src/chrome-extension/popup/pages/onboarding/login.js';
import { ObjectCache } from '/src/utils/object-cache.js';
import { Wallets } from '/src/blockchain/Wallets.js';
// Development mode
if (process.env.DEV_MODE) import('/src/chrome-extension/popup/dev-mode.js');
// E2E tests
if (process.env.TEST_MODE) import('/tests/start.js');

/**
 * Persistent data map @ chrome.storage.local
 *
 * salt: <string> generated salt for password
 * password: <string> hash of the main password to this extension
 * wallets: {public_key: {blockchain: 'Internet Computer', name: string, public: string, secret: { ciphertext, iv, salt }, style: string, tokens: {canisterId: {}, ...}}, ...}
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

        // ICP Ledger canister id
        this.ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

        // ICP Index canister id
        this.ICP_INDEX_CANISTER_ID = 'qhbym-qaaaa-aaaaa-aaafq-cai';

        // Launch
        document.addEventListener('DOMContentLoaded', () => { this.init(); }, { once: true });

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

    async init() {

        // Initialize history system
        this.log = new LogSystem();

        // Detect macOS
        if (navigator.userAgent.includes('Mac')) {
            document.body.classList.add('macos');
        }

        // Bottom Sheet
        this.sheet = new Sheet({ app: this, selector: '#sheet', hidden: true });

        // Active page
        this.current = null;

        // User credentials
        this.user = {
            password: null,
        };

        // Wallets list { ICPWallet, ... }
        this.wallets = new Wallets(this);

        // Actor cache
        this.cache = new ObjectCache();

        // Get storage session data
        const storageSession = await chrome.storage.session.get(['active', 'password', 'created']);
        if (storageSession.hasOwnProperty('active') && storageSession.active === true && storageSession.hasOwnProperty('created')) {

            // Check if session 'created' timestamp is older than 1 hour and clear session if expired
            const createdTime = new Date(storageSession.created).getTime();
            const ONE_HOUR = 60 * 60 * 1000;
            if (isNaN(createdTime) || (Date.now() - createdTime) > ONE_HOUR) {
                await chrome.storage.session.remove(['active', 'password', 'created']);
                await this.init();
                return;
            }

            // Password
            this.user.password = storageSession.password;

            // Show accounts list
            this.page('accounts');

        }

        // No active session
        else {
            // Check that password exists
            const storageLocal = await chrome.storage.local.get(['salt', 'password', 'terms']);

            // Login
            if (storageLocal.salt && storageLocal.password) {
                this.page('login', {salt: storageLocal.salt, hash: storageLocal.password});
            }

            // First time
            else {
                // Accept terms of use
                if (!storageLocal.hasOwnProperty('terms') || storageLocal.terms == false) {
                    this.page('terms');
                }
                // Create password (should be created but just in case)
                else {
                    this.page('register-password');
                }
            }
        }

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
                this.current = new PageAcceptTerms({ app: this });
                this.append(this.current);
                break;
            case 'register-password':
                this.current = new PageRegisterPassword({ app: this });
                this.append(this.current);
                break;
            case 'login':
                this.current = new PageLogin({ app: this, ...args });
                this.append(this.current);
                break;
            case 'accounts':
                this.current = new PageAccounts({ app: this });
                this.append(this.current);
                break;
        }

    }

    /**
     * Determines if a canister ID corresponds to the ICP Ledger.
     * @param {string} canisterId - The canister ID to check.
     * @returns {boolean} - True if the canister ID is the ICP Ledger, false otherwise.
     */

    isICPLedger(canisterId) {
        return canisterId === this.ICP_LEDGER_CANISTER_ID;
    }
}

/**
 * Start
 */

new GrindWalletPlugin('#app');
