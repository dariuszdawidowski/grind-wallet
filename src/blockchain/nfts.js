/**
 * Manages a collection of NFTs.
 */

export class NFTs {

    constructor({ app, wallet, nfts = {} }) {
        // References
        this.app = app;
        this.wallet = wallet;

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.list = nfts;
    }

    /**
     * Add NFT to the collection and rebuild it
     * @param {NFT} nft - The NFT object to add.
     */

    add(nft) {
        this.list[`${nft.collection}:${nft.id}`] = nft;
    }

    /**
     * Remove NFT from the collection
     * @param {string} `${nft.collection}:${nft.id}`
     */

    del(nftId) {
        delete this.list[nftId];
    }

    /**
     * Get NFT by collection and NFT ID or get all NFTs
     * @param {string} nft
     * @returns {NFT | NFT[]}
     */

    get(collectionId = null, nftId = null) {
        // Get all NFTs
        if (!collectionId && !nftId) return this.list;
        // Get by single key string `${collectionId}:${nftId}`
        if (collectionId && !nftId) return this.list[collectionId];
        // Get by separate collectionId, nftId
        if (collectionId && nftId) return this.list[`${collectionId}:${nftId}`];
        return null;
    }

    /**
     * Count of NFTs
     * @returns {number}
     */

    count() {
        return Object.keys(this.list).length;
    }

    /**
     * Serialize the NFTs collection
     */

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

}
