/**
 * Stores data objects with expiration timestamps in Chrome local storage
 */

export class DataCache {

    constructor() {

        // Cached objects { 'id': { timestamp, data: { ... } }, ... }
        this.cache = {};

    }

    /**
     * Initialize and load from storage
     */

    async init() {
        // Load existing entries from storage
        const stored = await chrome.storage.local.get(['datacache']);
        if (stored.hasOwnProperty('datacache')) {
            this.cache = stored['datacache'];
        }
    }

    /**
     * Save to storage
     */

    async save() {
        await chrome.storage.local.set({ datacache: this.cache });
    }

    /**
     * Check whether a timestamp exists for the given id and whether it is overdue
     * @returns data if created or refreshed, false if not expired yet
     */

    get({ id, create = null, overdue = null }) {
        // Create: fresh or found but expired
        if (!(id in this.cache) || this.cache[id].timestamp <= Date.now()) {
            this.cache[id] = { timestamp: Date.now() + overdue };
            const data = (create !== null) ? create() : null;
            if (data !== null) this.cache[id].data = data;
            this.save();
        }

        // Read: not expired yet
        return this.cache[id].data;
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
