/**
 * NFT ICRC-7 format
 * Tutorial: https://internetcomputer.org/docs/current/tutorials/developer-journey/level-5/5.4-NFT-tutorial
 * Metadata: https://github.com/dfinity/ICRC/issues/76
 */

import { Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as idlFactoryMinter } from '/src/blockchain/InternetComputer/candid/nft-icrc37.did.js';

export class NFT_ICRC7 {

    /**
     * Constructor
     * @param agent: HttpAgent - agent
     * @param collection: NFT collection canister id
     */

    constructor({ agent, collection }) {

        // Agent
        this.agent = agent;

        // Actor
        this.actor = Actor.createActor(idlFactoryMinter, { agent: agent, canisterId: collection });

        // Collection id
        this.collection = collection;
    }

    /**
     * Is agent identity owner of the given NFT
     * @param token: Number - token id
     */

    async amIOwner({ token }) {
        const principal = await this.agent.getPrincipal();
        const result = await this.actor.icrc7_owner_of([BigInt(token)]);

        if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
            if (result[0][0].owner.toString() === principal.toString()) return true;
        }

        return false;
    }

    /**
     * Transfer NFT to other account
     * @param token: Number - token id
     * @param to: string - to principal id
     */

    async transfer({ token, to }) {

        let result = null;
        try {
            result = await this.actor.icrc7_transfer([{
                to: { owner: Principal.fromText(to), subaccount: [] },
                token_id: BigInt(token),
                memo: [],
                from_subaccount: [],
                created_at_time: []
            }]);
        }
        catch (error) {
            return {'ERROR': error};
        }

        if (result && Array.isArray(result) && result.length > 0 && Array.isArray(result[0]) && result[0].length > 0 && 'Ok' in result[0][0]) {
            return {'OK': result[0][0].Ok};
        }

        return {'ERROR': 'Transfer failed'};
    }

    /**
     * Get metadata of the NFT
     * @param token: Number - token id
     * @param type: string - type of data to get: name | description | image | preview | experience | attributes | none for all
     */

    async getMetadata({ token, type }) {

        const result = await this.actor.icrc7_token_metadata([BigInt(token)]);

        if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
            const metadata = Object.fromEntries(result[0][0]);
            if (!type) {
                return metadata;
            }
            else if ((`icrc7:metadata:uri:${type}` in metadata) && ('Text' in metadata[`icrc7:metadata:uri:${type}`])) {
                return metadata[`icrc7:metadata:uri:${type}`].Text;
            }
        }

        return null;
    }

    /**
     * Get image of the NFT
     * @param token: Number - token id
     */

    async getImage({ token }) {
        const data = await this.getMetadata({ token, type: 'image' });
        return await this.fetchImage({ url: data });
    }

    /**
     * Get image miniature data
     * @param token: Number - token id
     */

    async getThumbnail({ token }) {
        const data = await this.getMetadata({ token, type: 'preview' });
        return await this.fetchImage({ url: data });
    }

    /**
     * Fetch image data
     */

    async fetchImage({ url }) {

        const response = await fetch(url);

        if (!response.ok) return null;

        // Detect image format
        const contentType = response.headers.get('content-type');

        // SVG
        if (contentType.includes('image/svg+xml')) {
            return await response.text();
        }

        // PNG, JPG, WEBP, GIF, TIFF
        else if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/tiff'].some(type => contentType.includes(type))) {
            const imageBlob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(`<img src="${reader.result}">`);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

        }

        return null;
    }

    /**
     * Get full page
     * @param token: Number - token id
     * @returns string with url
     */

    async experience({ token }) {
        const data = await this.getMetadata({ token, type: 'image' });
        return data;
    }

    /**
     * Get transaction history
     * @param results: Number - number of results to fetch
     * @param types: Array - types of transactions to fetch or null for all
     * @return { id: {
     *     type: 'send.nft' | 'recv.nft' | 'aprv.nft',
     *     pid: 'my principal id',
     *     to|from: { account: string },
     *     nft: { collection: 'principal id', id: Number }
     * }, ...}
     */

    async transactions({ results = 100, types = null } = {}) {
        return {};
    }

}
