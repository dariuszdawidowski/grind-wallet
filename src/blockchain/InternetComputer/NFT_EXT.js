/**
 * NFT EXT format
 * GitHub for an EXT standard: https://github.com/Toniq-Labs/extendable-token
 */

import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from './NFT_EXT.did.js';

export class NFT_EXT {

    /**
     * Constructor
     * @param agent: HttpAgent - agent
     * @param collection: string - NFT collection canister id
     */

    constructor({ agent, collection }) {

        // Agent
        this.agent = agent;

        // Actor
        this.actor = Actor.createActor(idlFactory, { agent, canisterId: collection });

        // Collection id
        this.collection = collection;

    }

    /**
     * Is agent owner of the given NFT
     * @param token: string - token id
     */

    async isOwner({ token }) {
        const principal = await this.agent.getPrincipal();
        const result = await this.actor.balance({ token: token, user: { principal } });

        if ('ok' in result && result.ok > 0) return true;

        return false;
    }

    /**
     * Transfer NFT to other account
     * @param token: string - token id
     * @param to: string - to principal id
     */

    async transfer({ token, to }) {
        const principal = await this.agent.getPrincipal();
        const result = await this.actor.transfer({
            token: token,
            to: { principal: Principal.fromText(to) },
            from: { principal },
            notify: false,
            memo: [],
            subaccount: [],
            amount: 1
        });

        if ('ok' in result && Number(result.ok) == 1) return true;

        return false;
    }

    /**
     * Get data (image or text) of the NFT
     * @param token: string - token id
     */

    async getData({ token }) {

        const response = await fetch(`https://${this.collection}.raw.icp0.io/?tokenid=${token}`);

        if (!response.ok) return null;

        // Detect image format
        const contentType = response.headers.get('content-type');

        // SVG
        if (contentType.includes('image/svg+xml')) {
            const text = await response.text();
            return text;
        }

        // PNG, JPG, WEBP, GIF, TIFF
        else if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/tiff'].some(type => contentType.includes(type))) {
            const imageBlob = await response.blob();
            const img = URL.createObjectURL(imageBlob);
            return img;
        }

        return null;
    }

    /**
     * Get image miniature data
     * @param token: string - token id
     */

    async getThumbnail(args) {
        return await this.getImage(args);
    }
        
}
