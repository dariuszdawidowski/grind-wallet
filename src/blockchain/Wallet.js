/**
 * Abstract class representing a blockchain wallet.
 */

import { Tokens } from './tokens.js';
import { NFTs } from './nfts.js';

export class Wallet {

    /**
     * Constructor.
     * @param {Object} raw serialized data
     */

    constructor({ blockchain, name, publicKey, secret, tokens, nfts }) {

        /*** Persistent attributes ***/

        // Blockchain name: string
        this.blockchain = blockchain;

        // Wallet custom name: string
        this.name = name;

        // Public key: string
        this.public = publicKey;

        // Encrypted private key {ciphertext: 'string', iv: 'string', salt: 'string'}
        this.secret = secret;

        /*** Partially persistent attributes ***/

        // Tokens list: object { canisterId: Token object }
        this.tokens = new Tokens(tokens);

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.nfts = new NFTs(nfts);

        /*** Dynamic attributes ***/

        // Identity: object Identity
        this.identity = null;

        // Principal ID: string
        this.principal = null;

        // Account ID: string
        this.account = null;

        // Agent: object HttpAgent
        this.agent = null;

        // Rebuilded dynamic attributes: int timestamp
        this.rebuilded = null;

    }

    serialize() {
        return {
            blockchain: this.blockchain,
            name: this.name,
            public: this.public,
            secret: this.secret,
            tokens: this.tokens.serialize(),
            nfts: this.nfts.serialize()
        };
    }

}
