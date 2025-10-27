/**
 * Manages a collection of NFTs.
 */

export class NFTs {

    constructor(nfts = {}) {

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.list = nfts;

    }

    serialize() {
        if (Object.keys(this.list).length === 0) return {};
        return Object.fromEntries(
            Object.entries(this.list).map(([key, value]) => [
                key,
                {
                    id: value.id,
                    standard: value.standard,
                    collection: value.collection,
                    thumbnail: value.thumbnail
                }
            ])
        );
    }

    /**
     * Count of NFTs
     * @returns {number}
     */

    count() {
        return Object.keys(this.list).length;
    }

}
