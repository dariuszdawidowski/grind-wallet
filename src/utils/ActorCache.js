/*** Cache Actors in the memory ***/

export class ActorCache {

    constructor() {

        // Cached actors { 'token|nft:canisterId': Actor }
        this.actors = {};
    }

    // Return or create a new actor
    get(actorId) {
        // Actor cached
        if (actorId in this.actors) return this.actors[canisterId];

        // Create new actor
        // const actor = Actor.createActor(actorId);
        return null;
    }

}
