/**
 * Stores data objects with expiration timestamps in Chrome local storage
 */

export class DataCache {

    constructor() {

        // Cached objects { 'id': { timestamp, custom_data... }, ... }
        this.cache = {};

    }

    /**
     * Initialize from storage
     */

    async init() {
        // Load existing timestamps from storage
        const stored = await chrome.storage.local.get(['timestamps']);
        if (stored.hasOwnProperty('timestamps')) {
            this.cache = stored['timestamps'];
        }
    }

    /**
     * Save to storage
     */

    async save() {
        await chrome.storage.local.set({ timestamps: this.cache });
    }

    /**
     * Check whether a timestamp exists for the given id and whether it is overdue
     * @returns boolean true if expired
     */

    expired({ id, overdue = null }) {
        // Fresh or Found and expired
        if (!(id in this.cache) || this.cache[id] <= Date.now()) {
            this.cache[id] = Date.now() + overdue;
            this.save();
            return true;
        }

        // Not expired yet
        return false;
    }

    /**
     * Reset
     * @param id: string - id possible with wilcards *
     */

    reset({ id }) {
        if (!id) {
            this.cache = {};
            this.save();
            return;
        }

        if (!id.includes('*')) {
            delete this.cache[id];
            this.save();
            return;
        }

        const pattern = id
            .split('*')
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('.*');
        const matcher = new RegExp(`^${pattern}$`);

        for (const key of Object.keys(this.cache)) {
            if (matcher.test(key)) {
                delete this.cache[key];
            }
        }
        this.save();
    }

}
