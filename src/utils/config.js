/**
 * Configuration manager
 */

import { browser } from '/src/utils/browser.js';

export class Config {

    constructor({ app }) {
        this.app = app;

        // Generete anonymous client ID for this installation
        this.clientId = null;

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
        const storage = await browser.storage.local.get(['cfg:cid', 'cfg:hide', 'cfg:scroll', 'cfg:session', 'cfg:errors']);
        if (storage.hasOwnProperty('cfg:cid')) this.clientId = storage['cfg:cid'];
        else {
            this.clientId = crypto.randomUUID();
            await browser.storage.local.set({ 'cfg:cid': this.clientId });
        }
        if (storage.hasOwnProperty('cfg:hide')) this.hideBalances = storage['cfg:hide'];
        if (storage.hasOwnProperty('cfg:scroll')) this.showScrolls = storage['cfg:scroll'];
        if (storage.hasOwnProperty('cfg:session')) this.sessionTimeout = storage['cfg:session'];
        if (storage.hasOwnProperty('cfg:errors')) this.sendErrors = storage['cfg:errors'];
    }

    /**
     * Save configuration
     */

    async save() {
        await browser.storage.local.set({
            'cfg:hide': this.hideBalances,
            'cfg:scroll': this.showScrolls,
            'cfg:session': this.sessionTimeout,
            'cfg:errors': this.sendErrors,
        });
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