/**
 * Manages a collection of NFTs.
 */

export class NFTs {

    constructor(nfts = {}) {

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.list = nfts;

        // List proxy to access NFTs directly by their collectionId:nftId
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return target.list[prop];
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                } else {
                    target.list[prop] = value;
                }
                return true;
            }
        });

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

}
