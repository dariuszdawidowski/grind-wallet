import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
import { saveImage } from '/src/utils/ImageCache.js';

export class SheetAddCustomNFT extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

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
        const address = new InputAddress({
            placeholder: 'Canister ID'
        });
        this.append(address);

        // NFT id field
        const token = new InputAddress({
            placeholder: 'NFT ID'
        });
        token.element.style.marginTop = '0';
        this.append(token);

        // NFT info pocket
        const info = document.createElement('div');
        info.style.display = 'flex';
        info.style.flexDirection = 'column';
        info.style.justifyContent = 'center';
        info.style.alignItems = 'center';
        info.style.margin = '0 0 20px 0';
        this.element.append(info);

        // NFT metadata fetched
        this.metadata = null;

        // Button
        const submit = new Button({
            text: 'Verify',
            click: () => {

                // Token canister ID
                address.disable();
                const canisterId = address.get();
                const tokenId = token.get();

                // First pass (fetch)
                if (!this.metadata) {
                    submit.busy(true);
                }

                // Second pass (accept)
                else {
                }
            }
        });
        this.append(submit);

    }

}

