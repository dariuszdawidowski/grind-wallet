/**
 * Configuration manager
 */

import { browser } from '/src/utils/browser.js';

export class Config {

    constructor({ app }) {
        this.app = app;

        // Properties
        this.hideBalances = false;
        this.showScrolls = true;
        this.sessionTimeout = 60;
        this.sendErrors = false;
    }

    /**
     * Load configuration
     */

    async load() {
        const storageCfg = await browser.storage.local.get('cfg');
        if (storageCfg.hasOwnProperty('cfg')) {
            const cfg = storageCfg.cfg;
            this.hideBalances = cfg.hasOwnProperty('hide') ? cfg.hide : this.hideBalances;
            this.showScrolls = cfg.hasOwnProperty('scroll') ? cfg.scroll : this.showScrolls;
            this.sessionTimeout = cfg.hasOwnProperty('session') ? cfg.session : this.sessionTimeout;
            this.sendErrors = cfg.hasOwnProperty('errors') ? cfg.errors : this.sendErrors;
        }
    }

    /**
     * Save configuration
     */

    async save() {
        await browser.storage.local.set({ 'cfg': {
            'hide': this.hideBalances,
            'scroll': this.showScrolls,
            'session': this.sessionTimeout,
            'errors': this.sendErrors,
        } });
    }

    /**
     * Apply configuration
     */

    apply() {
        // Hide Balances
        if (this.hideBalances) this.app.hideBalances();
        else this.app.showBalances();
        // Scrollbars
        if (this.showScrolls) this.app.showScrollbars();
        else this.app.hideScrollbars();
    }

}