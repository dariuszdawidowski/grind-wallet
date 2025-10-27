/*** Cache Objects in the memory ***/

export class ObjectCache {

    constructor() {

        // Cached objects { 'id': Object }
        this.cache = {};

        // Overdue timestamps { 'same id': timestamp }
        this.timestamps = {};

        // Constant definitions
        this.ONE_SECOND = 1000;
        this.ONE_MINUTE = 60 * this.ONE_SECOND;
    }

    // Return or create a new object
    get({ id, create = null, overdue = null }) {

        // Object cached
        if (id in this.cache) {
            // Check overdue
            if (overdue !== null) {
                const now = Date.now();
                const timestamp = this.timestamps[id] || 0;
                if ((now - timestamp) > overdue) {
                    // Create new object
                    if (create !== null) {
                        this.cache[id] = create();
                        this.timestamps[id] = now + overdue;
                        return this.cache[id];
                    }
                    // Remove cached object
                    else {
                        delete this.cache[id];
                        delete this.timestamps[id];
                    }
                }
            }
            return this.cache[id];
        }

        // Create new object
        if (create !== null) {
            this.cache[id] = create();
            if (overdue !== null) this.timestamps[id] = Date.now() + overdue;
            return this.cache[id];
        }
        
        return null;
    }

}
