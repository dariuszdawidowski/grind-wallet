/*** Cache Objects in the memory ***/

export class ObjectCache {

    constructor() {

        // Cached actors { 'token|nft:canisterId': Actor }
        this.cache = {};
    }

    // Return or create a new actor
    get(objId) {
        // Object cached
        if (objId in this.cache) return this.cache[objId];

        // Create new object
        
        return null;
    }

}
