import { Actor } from '@dfinity/agent';
import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
import { saveImage } from '/src/utils/ImageCache.js';
import { idlFactory as idlFactoryEXT } from '/src/blockchain/InternetComputer/candid/NFT_EXT.did.js';

export class SheetAddCustomNFT extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // UI controls widgets
        this.widget = {};

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
        this.widget.info.style.display = 'flex';
        this.widget.info.style.flexDirection = 'column';
        this.widget.info.style.justifyContent = 'center';
        this.widget.info.style.alignItems = 'center';
        this.widget.info.style.margin = '0 0 20px 0';
        this.element.append(this.widget.info);


        // Button
        this.widget.submit = new Button({
            text: 'Verify',
            click: this.verifyAndAccept.bind(this)
        });
        this.append(this.widget.submit);

    }

    async verifyAndAccept() {

        // NFT actor and metadata fetched from canister
        const actor = null;
        const metadata = null;

        // NFT canister ID and token ID
        this.widget.address.disable();
        const canisterId = this.widget.address.get();
        const tokenId = this.widget.token.get();

        // First pass (fetch actor+metadata & verify)
        if (!actor && !metadata) {
            this.widget.submit.busy(true);
            this.connectCanister(canisterId).then((info) => {
                this.widget.submit.busy(false);
                if (info.valid) {
                }
                else {
                    this.widget.address.enable();
                    actor = null;
                    metadata = null;
                    alert('Unable to fetch or reckognize NFT');
                }
            });
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
            console.log(actor);
            // metadata = await actor.metadata({});
        // }
        // catch () {}

        // OK
        return {
            valid: true,
            standard: 'EXT',
            actor,
            // metadata: Object.fromEntries(metadata)
        };
    }

}

