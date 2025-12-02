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
        this.sessionTime = 60;
        this.sendErrors = false;
    }

    /**
     * Load configuration
     */

    async load() {
        const storage = await browser.storage.local.get(['cfg:hide', 'cfg:scroll', 'cfg:session', 'cfg:errors']);
        if (storage.hasOwnProperty('cfg:hide')) this.hideBalances = storage['cfg:hide'];
        if (storage.hasOwnProperty('cfg:scroll')) this.showScrolls = storage['cfg:scroll'];
        if (storage.hasOwnProperty('cfg:session')) this.sessionTime = storage['cfg:session'];
        if (storage.hasOwnProperty('cfg:errors')) this.sendErrors = storage['cfg:errors'];
    }

    /**
     * Save configuration
     */

    async save() {
        await browser.storage.local.set({
            'cfg:hide': this.hideBalances,
            'cfg:scroll': this.showScrolls,
            'cfg:session': this.sessionTime,
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
    }

}