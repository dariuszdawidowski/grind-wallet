import { Component } from '/src/utils/component.js';
import { loadImage } from '/src/utils/image-cache.js';

export class TokenImage extends Component {

    constructor(args) {
        super(args);

        // Coin shape
        this.element.classList.add('token-image');

        // ICP logo
        if (args.canisterId == args.app.ICP_LEDGER_CANISTER_ID) {
            this.element.style.backgroundImage = `url('assets/icp-logo.svg')`;
        }
        // Load cached token image
        else (async () => {
            try {
                const image = await loadImage(`token:${args.canisterId}`);
                this.element.style.backgroundColor = 'transparent';
                // SVG
                if (image.startsWith('<svg')) {
                    this.element.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(image)}')`;
                }
                // Raster
                else {
                    this.element.style.backgroundImage = `url('${image}')`;
                }
            }

            // Fallback text
            catch(error) {
                this.element.innerText = args.wallet.tokens[args.canisterId].symbol;
            }
        })();

    }

}
