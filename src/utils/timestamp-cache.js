/**
 * Stores only id + timestamp of the last operation without data
 */

export class TimestampCache {

    constructor() {

        // Cached objects { 'id': timestamp }
        this.cache = {};

    }

    /**
     * Check whether a timestamp exists for the given id and whether it is overdue
     * @returns boolean true if expired
     */

    expired({ id, overdue = null }) {
        // Fresh
        if (!(id in this.cache)) {
            this.cache[id] = Date.now() + overdue;
            return true;
        }

        // Found and expired
        if (this.cache[id] <= Date.now()) {
            this.cache[id] = Date.now() + overdue;
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
            return;
        }

        if (!id.includes('*')) {
            delete this.cache[id];
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
    }

}
