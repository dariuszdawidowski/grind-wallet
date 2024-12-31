/**
 * NFT DIP721 format
 * GitHub for a DIP721 standard: https://github.com/Psychedelic/DIP721
 * Doc: https://internetcomputer.org/docs/current/references/samples/rust/dip721-nft-container/
 */

import { idlFactory } from './NFT_DIP721_v1.did.js';
import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export class NFT_DIP721 {

    /**
     * Constructor
     * @param args.agent: HttpAgent - agent
     * @param args.collection: NFT collection canister id
     */

    constructor({ agent, collection }) {

        // Agent
        this.agent = agent;

        // Actor
        this.actor = Actor.createActor(idlFactory, { agent: agent, canisterId: collection });
    }

    /**
     * Is agent owner of the given NFT
     * @param token: Number - token id
     */

    async isOwner({ token }) {
        const principal = await this.agent.getPrincipal();
        const result = await this.actor.ownerOfDip721(token);

        if ('Ok' in result) {
            if (result.Ok.toString() === principal.toString()) return true;
        }

        return false;
    }

    /**
     * Transfer NFT to other account
     * @param token: Number - token id
     * @param to: string - to principal id
     */

    async transfer({ token, to }) {

        const principal = await this.agent.getPrincipal();
        const result = await this.actor.transferFromDip721(principal, Principal.fromText(to), token);

        // Transaction id in the response.OK
        if ('Ok' in response) return true;

        return false;
    }

    /**
     * Get data (image or text) of the NFT
     * @param token: Number - token id
     */

    async getData({ token }) {

        const result = await this.actor.getMetadataDip721(token);

        if ('Ok' in result && result.Ok.length > 0) {
            const headers = Object.fromEntries(result.Ok[0].key_val_data);
            if ('contentType' in headers && 'TextContent' in headers.contentType && 'data' in result.Ok[0]) {

                // Text, SVG
                if (['text/plain', 'image/svg+xml'].some(type => headers.contentType.TextContent.includes(type))) {
                    const text = new TextDecoder().decode(result.Ok[0].data);
                    return text;
                }

                // PNG, JPG, WEBP, GIF, TIFF
                else if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/tiff'].some(type => headers.contentType.TextContent.includes(type))) {
                    const text = new TextDecoder().decode(result.Ok[0].data);
                    return `<img src="data:${headers.contentType.TextContent};base64,${text}" />`;
                }
            }
        }
        return null;
    }

    /**
     * Get image miniature data
     * @param args.tokenId: string - token id
     */

    async getThumbnail(args) {
    }

}
