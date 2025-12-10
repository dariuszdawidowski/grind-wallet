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

    constructor({ app, blockchain, name, publicKey, secret, tokens, nfts }) {

        // References
        this.app = app;

        /*** Persistent attributes ***/

        // Blockchain name: string
        this.blockchain = blockchain;

        // Wallet custom name: string
        this.name = name;

        // Public key: string
        this.public = publicKey;

        // Encrypted private key and mnemonic
        // {private: {ciphertext: 'string', iv: 'string', salt: 'string'}, mnemonic: {ciphertext: 'string', iv: 'string', salt: 'string'}}
        this.secret = secret;

        /*** Partially persistent attributes ***/

        // Tokens list: object { canisterId: Token object }
        this.tokens = new Tokens({ app: this.app, wallet: this, ...tokens });

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.nfts = new NFTs({ app: this.app, wallet: this, ...nfts });

        /*** Dynamic attributes ***/

        // Identity: object Identity
        this.identity = null;

        // Principal ID: string
        this.principal = null;

        // Account ID: string
        this.account = null;

        // Agent: object HttpAgent
        this.agent = null;

    }

    serialize() {
        return {
            blockchain: this.blockchain,
            name: this.name,
            secret: this.secret,
            tokens: this.tokens.serialize(),
            nfts: this.nfts.serialize()
        };
    }

}
