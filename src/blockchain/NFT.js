/**
 * NFT adapter
 */

import { NFT_ICRC7 } from '/src/blockchain/InternetComputer/NFT_ICRC7.js';
import { NFT_EXT } from '/src/blockchain/InternetComputer/NFT_EXT.js';
import { NFT_DIP721 } from '/src/blockchain/InternetComputer/NFT_DIP721_v1.js';

export class NFT {

    constructor({ app, principal, agent, collection, id, thumbnail, standard }) {
        
        // App
        this.app = app;

        // Principal
        this.principal = principal;

        // Agent
        this.agent = agent;

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
     * Force to cache lazy service
     */

    async cache() {
        if (!this.service) this.service = await this.app.cache.get({
            id: `${this.principal}:nft:${this.collection}`,
            create: () => {
                if (this.standard == 'EXT') {
                    return new NFT_EXT({ agent: this.agent, collection: this.collection });
                }
                else if (this.standard == 'ICRC-7') {
                    return new NFT_ICRC7({ agent: this.agent, collection: this.collection });
                }
                else if (this.standard == 'DIP-721') {
                    return new NFT_DIP721({ agent: this.agent, collection: this.collection });
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
