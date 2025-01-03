
export class NFT {

    constructor({ collection, id, thumbnail, standard }) {
        
        // Collection ID
        this.collection = collection;

        // NFT ID
        this.id = id;

        // Thumbnail
        this.thumbnail = thumbnail;

        // NFT format
        this.standard = standard;

    }

    /**
     * Serialize data
     * @returns {object} Serialized
     */

    serialize() {
        return {
            collection: this.collection,
            id: this.id,
            thumbnail: this.thumbnail,
            standard: this.standard
        };
    }

}
