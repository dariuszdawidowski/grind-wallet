import { Actor } from '@dfinity/agent';
import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
import { saveImage } from '/src/utils/ImageCache.js';
import { idlFactory as idlFactoryEXT } from '/src/blockchain/InternetComputer/candid/NFT_EXT.did.js';
import { NFT_EXT } from '/src/blockchain/InternetComputer/NFT_EXT.js';

export class SheetAddCustomNFT extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // UI controls widgets
        this.widget = {};

        // Token actor and metadata fetched from canister
        this.actor = null;
        this.metadata = null;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Enter the <b>Canister ID</b> and <b>Token ID</b><br>
                of the Internet Computer blockchain NFT.
            </h3>
            <h3>Accepted standards: <b>ICRC-7</b>/<b>37</b>, <b>DIP-721</b>, <b>EXT</b></h3>
        `;

        // Address field
        this.widget.address = new InputAddress({
            placeholder: 'Canister ID'
        });
        this.append(this.widget.address);

        // NFT id field
        this.widget.token = new InputAddress({
            placeholder: 'NFT ID'
        });
        this.widget.token.element.style.marginTop = '0';
        this.append(this.widget.token);

        // NFT info pocket
        this.widget.info = document.createElement('div');
        this.widget.info.classList.add('preview');
        this.element.append(this.widget.info);

        // Button
        this.widget.submit = new Button({
            text: 'Verify',
            click: this.verifyAndAccept.bind(this)
        });
        this.append(this.widget.submit);

    }

    async verifyAndAccept() {

        this.widget.address.disable();
        this.widget.token.disable();

        // NFT canister ID and token ID
        const canisterId = this.widget.address.get();
        const tokenId = this.widget.token.get();

        // First pass (fetch actor+metadata & verify)
        if (!this.actor && !this.metadata) {
            this.widget.submit.busy(true);
            const info = await this.connectCanister(canisterId);
            if (info.valid) {
                this.actor = info.actor;
                this.metadata = info.metadata;
                const nftEXT = new NFT_EXT({ agent: this.wallet.agent, actor: this.actor, collection: canisterId });
                const ownEXT = await nftEXT.isOwner({ token: tokenId });
                if (ownEXT) {
                    const imgEXT = await nftEXT.getImage({ token: tokenId });
                    this.widget.info.innerHTML = imgEXT;
                    this.widget.info.style.height = '80px';
                    this.widget.submit.set('Add to my wallet');
                }
                else  {
                    this.widget.address.enable();
                    this.widget.token.enable();
                    this.actor = null;
                    this.metadata = null;
                    alert('You do not own this NFT');
                }
            }
            else {
                this.widget.address.enable();
                this.widget.token.enable();
                this.actor = null;
                this.metadata = null;
                alert('Unable to fetch or recognize NFT');
            }
            this.widget.submit.busy(false);
        }

    }

    async connectCanister(canisterId) {
        let actor = null
        let metadata = null;

        console.log('Connecting to canister:', canisterId);

        // Try EXT standard
        // try {
            actor = Actor.createActor(idlFactoryEXT, {
                agent: this.wallet.agent,
                canisterId,
            });
            // metadata = await actor.metadata({});
        // }
        // catch () {}

        // OK
        return {
            valid: true,
            standard: 'EXT',
            actor,
            metadata
        };
    }

}

