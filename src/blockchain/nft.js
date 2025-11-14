/**
 * NFT adapter
 */

import { NFT_ICRC7 } from '/src/blockchain/InternetComputer/nft-icrc7.js';
import { NFT_EXT } from '/src/blockchain/InternetComputer/nft-ext.js';

export class NFT {

    constructor({ app, wallet, collection, id, thumbnail, standard }) {
        
        // App
        this.app = app;

        // Wallet
        this.wallet = wallet;

        // Collection ID
        this.collection = collection;

        // NFT ID
        this.id = id;

        // Thumbnail
        this.thumbnail = thumbnail;

        // NFT format
        this.standard = standard;

        // Service handler
        this.service = null;

    }

    /**
     * Build the NFT
     */

    build() {
        // Build the NFT
    }

    /**
     * Force to cache lazy service
     */

    async cache() {
        if (!this.service) this.service = await this.app.cache.ram.get({
            id: `${this.wallet.principal}:nft:${this.collection}`,
            create: () => {
                if (this.standard == 'EXT') {
                    return new NFT_EXT({ agent: this.wallet.agent, collection: this.collection });
                }
                else if (this.standard == 'ICRC-7') {
                    return new NFT_ICRC7({ agent: this.wallet.agent, collection: this.collection });
                }
                return null;
            }
        });
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
