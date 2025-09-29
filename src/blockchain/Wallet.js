export class Wallet {

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

        // ICP+ICRC tokens list: object { canisterId: Token object }
        // Token: { name: 'string', symbol: 'string', principal: 'string', account: 'string', balance: BingInt, decimals: int, fee: int, request: { functions }, actor: Actor object }
        this.tokens = tokens;

        // NFTs list: { 'collectionId:nftId': NFT object, ... }
        this.nfts = nfts;

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
            tokens: Object.fromEntries(
                Object.entries(this.tokens).map(([key, value]) => [
                    key,
                    { name: value.name, symbol: value.symbol, decimals: value.decimals, fee: value.fee }
                ])
            ),
            nfts: this.nfts ? Object.fromEntries(
                Object.entries(this.nfts).map(([key, value]) => [
                    key,
                    { id: value.id, standard: value.standard, collection: value.collection, thumbnail: value.thumbnail }
                ])
            ) : {}
        };
    }

}
