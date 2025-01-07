/*** Cache Objects in the memory ***/

export class ObjectCache {

    constructor() {

        // Cached objects { 'principal:type:canister': Object }
        this.cache = {};
    }

    // Return or create a new actor
    get({ id, create = null }) {

        // Object cached
        if (id in this.cache) return this.cache[id];

        // Create new object
        if (create) {
            this.cache[id] = create();
            return this.cache[id];
        }
        
        return null;
    }

}
