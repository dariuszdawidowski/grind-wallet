/*** Cache Objects in the memory ***/

export class ObjectCache {

    constructor() {

        // Cached objects { 'id': Object }
        this.cache = {};

        // Overdue timestamps { 'same id': end timestamp }
        this.timestamps = {};
    }

    // Return or create a new object
    get({ id, create = null, overdue = null }) {

        // Object cached
        if (id in this.cache) {
            // Check overdue
            if (id in this.timestamps) {
                const now = Date.now();
                // Still valid
                if (this.timestamps[id] > now) {
                    return this.cache[id];
                }
                // Remove overdue object
                else {
                    delete this.cache[id];
                    delete this.timestamps[id];
                }
            }
            // Simply return cached object
            else {
                return this.cache[id];
            }
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
