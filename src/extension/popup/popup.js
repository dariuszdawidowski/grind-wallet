/**
 * Grind Wallet extension
 * (c) 2024-2025 by Dariusz Dawidowski
 */

import { HttpAgent, Actor } from '@icp-sdk/core/agent';
import '/src/extension/popup/styles/variables.css';
import '/src/extension/popup/styles/base.css';
import '/src/extension/popup/styles/controls.css';
import '/src/extension/popup/styles/card.css';
import '/src/extension/popup/styles/coins.css';
import '/src/extension/popup/styles/nft.css';
import '/src/extension/popup/styles/tile.css';
import '/src/extension/popup/styles/history.css';
import '/src/extension/popup/styles/sheet.css';
import '/src/extension/popup/styles/exchange.css';
import '/src/extension/popup/styles/tasks.css';
import '/src/extension/popup/styles/list.css';
import '/src/extension/popup/styles/gamelets.css';
import '/src/extension/popup/styles/tab-bar.css';
import '/src/extension/popup/styles/overload.css';
import { browser } from '/src/utils/browser.js';
import { Config } from '/src/utils/config.js';
import { ErrorSystem } from '/src/utils/errors.js';
import { LogSystem } from '/src/utils/logger.js';
import { Session } from '/src/utils/session.js';
import { Drawer } from '/src/extension/popup/widgets/drawer.js';
import { Sheet } from '/src/extension/popup/widgets/sheet.js';
import { PageAcceptTerms } from '/src/extension/popup/pages/onboarding/terms.js';
import { PageRegisterPassword } from '/src/extension/popup/pages/onboarding/register-password.js';
import { PageHome } from '/src/extension/popup/pages/home/home-index.js';
import { PageAccounts } from '/src/extension/popup/pages/accounts/accounts-index.js';
import { PageSettings } from '/src/extension/popup/pages/settings/settings-index.js';
import { PageLogin } from '/src/extension/popup/pages/onboarding/login.js';
import { ObjectCache } from '/src/utils/object-cache.js';
import { DataCache } from '/src/utils/data-cache.js';
import { ImageCache } from '/src/utils/image-cache.js';
import { Wallets } from '/src/blockchain/wallets.js';
import { TaskManager } from '/src/extension/popup/widgets/tasks.js';
import { AddressBook } from '/src/extension/popup/widgets/address-book.js';
import { TabBar } from '/src/extension/popup/widgets/tab-bar.js';
const { version } = require('/package.json');
import { idlFactory as idlFactoryBackend } from '/src/blockchain/InternetComputer/candid/grind-backend.did.js';

// Development mode
if (process.env.DEV_MODE === '1') import('/src/extension/popup/dev-mode.js');
// E2E tests
if (process.env.TEST_MODE === '1') import('/e2e/start.js');

/**
 * Persistent data map @ browser.storage.local
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

        // Plugin version
        this.version = version;

        // Initialize error handling system
        this.errors = new ErrorSystem({ app: this });
        this.errors.init('Errors', [version]);

        // Main element
        this.element = document.querySelector(selector);

        // Prevent double click in the whole app
        this.element.addEventListener('dblclick', (e) => e.preventDefault());

        // ICP Ledger canister id
        this.ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';

        // ICP Index canister id
        this.ICP_INDEX_CANISTER_ID = 'qhbym-qaaaa-aaaaa-aaafq-cai';

        // Offline flag
        this._offline = false;

        // Launch
        document.addEventListener('DOMContentLoaded', () => { this.init(); }, { once: true });

        // Hide balance
        this.hidden = false;

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

        // Local environment config
        this.ENV = null;
        try {
            const imported = await import('/env.local.json', { assert: { type: 'json' } });
            this.ENV = imported.default || {};
        }
        catch (_) {
            console.error('Could not find env.local.json');
        }

        // Migrate old data if needed
        await this.migrate();

        // Initialize history system
        this.log = new LogSystem();

        // Detect macOS
        if (navigator.userAgent.includes('Mac')) {
            document.body.classList.add('macos');
        }

        // Active page
        this.current = null;

        // Drawer menu
        this.drawer = new Drawer();

        // Main bottom sheet
        this.sheet = new Sheet({ app: this, id: '#sheet', hidden: true });
        document.querySelector('#main-panel-content').append(this.sheet.element);

        // Task manager
        this.tasks = new TaskManager({ app: this });
        await this.tasks.init();

        // Wallets list { ICPWallet, ... }
        this.wallets = new Wallets({ app: this });

        // Cache
        this.cache = {
            ram: new ObjectCache(),
            info: new DataCache('cache:info'),
            image: new ImageCache()
        };
        await this.cache.info.init();

        // Address book
        this.addressbook = new AddressBook({ app: this });

        // Configuration manager
        this.config = new Config({ app: this });
        await this.config.load();
        this.config.apply();

        // Anonymous agent and backend canister actor
        this.anonymous = null;
        this.backend = null;
        HttpAgent.create().then(agent => {
            this.anonymous = agent;
            this.backend = Actor.createActor(idlFactoryBackend, {
                agent: this.anonymous,
                canisterId: this.ENV.backend
            });
        });

        // Tab bar
        if (process.env.DEV_MODE === '1') {
            this.tabbar = new TabBar({ app: this });
            this.tabbar.hide();
            this.append(this.tabbar);
        }

        // Session manager
        this.session = new Session();
        await this.session.init({

            timeout: this.config.sessionTimeout,

            // New session
            create: async () => {
                // Login page if password registered
                const storageLocal = await browser.storage.local.get(['salt', 'password', 'terms']);
                if (storageLocal.salt && storageLocal.password) {
                    this.page('login', { salt: storageLocal.salt, hash: storageLocal.password });
                }
                // First-time page with terms acceptance and password creation
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

            },

            // Continue session
            continue: async () => {
                // Show main page
                this.page('accounts');
            },

            // Expired session
            expired: async () => {
                const storageLocal = await browser.storage.local.get(['salt', 'password', 'terms']);
                // Show login page
                if (storageLocal.salt && storageLocal.password) {
                    this.page('login', { salt: storageLocal.salt, hash: storageLocal.password });
                }
            }

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
            case 'home':
                this.current = new PageHome({ app: this });
                this.append(this.current);
                break;
            case 'accounts':
                this.current = new PageAccounts({ app: this });
                this.append(this.current);
                break;
            case 'settings':
                this.current = new PageSettings({ app: this });
                this.append(this.current);
                break;
        }

    }

    /**
     * Show balances
     */

    showBalances() {
        this.hidden = false;
        this.element.classList.remove('hide-balances');
        this.sheet.element.classList.remove('hide-balances');
    }

    /**
     * Hide balances
     */

    hideBalances() {
        this.hidden = true;
        this.element.classList.add('hide-balances');
        this.sheet.element.classList.add('hide-balances');
    }

    /**
     * Show scrollbars
     */

    showScrollbars() {
        document.querySelector('#main-panel-content').classList.remove('hide-scrollbar');
        this.sheet.element.classList.remove('hide-scrollbar');
    }

    /**
     * Hide scrollbars
     */

    hideScrollbars() {
        document.querySelector('#main-panel-content').classList.add('hide-scrollbar');
        this.sheet.element.classList.add('hide-scrollbar');
    }

    /**
     * Check session
     */

    checkSession() {
        if (document.visibilityState === 'visible') {
            this.session.status().then(status => {
                if (status != 'valid') {
                    this.session.clear();
                    window.location.reload();
                }
            });
        }
    }

    /**
     * Determines if a canister ID corresponds to the ICP Ledger.
     * @param {string} canisterId - The canister ID to check.
     * @returns {boolean} - True if the canister ID is the ICP Ledger, false otherwise.
     */

    isICP(canisterId) {
        return canisterId === this.ICP_LEDGER_CANISTER_ID;
    }

    /**
     * Switch to offline mode on/off
     */

    offline(mode) {
        this._offline = mode;
        const topBanner = document.getElementById('top-banner');
        if (topBanner) {
            if (mode == true && !topBanner.innerText.includes('OFFLINE')) topBanner.innerText = topBanner.innerText + ' [OFFLINE]';
            else topBanner.innerText.replace(' [OFFLINE]', '');
        }
        else {
            const devBanner = document.createElement('div');
            devBanner.id = 'top-banner';
            devBanner.textContent = 'OFFLINE';
            devBanner.style.backgroundColor = '#5b36ffff';
            document.body.insertBefore(devBanner, document.body.firstChild);
        }
    }

    /**
     * Is in offline mode
     */

    isOffline() {
        return this._offline;
    }

    /**
     * Migrate old data if needed
     */

    async migrate() {
        try {
            // 0.6.2 -> 0.6.3: remove old timestamps
            const storageLocal = await browser.storage.local.get('timestamps');
            if (storageLocal && Object.prototype.hasOwnProperty.call(storageLocal, 'timestamps')) {
                await browser.storage.local.remove(['timestamps']);
            }
        }
        catch (_) {}
    }

}

/**
 * Start
 */

new GrindWalletPlugin('#app');
