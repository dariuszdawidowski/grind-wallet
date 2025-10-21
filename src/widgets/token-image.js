import { Component } from '/src/utils/Component.js';
import { loadImage } from '/src/utils/ImageCache.js';

export class TokenImage extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Token Canister ID
        this.canisterId = args.canisterId;

        // Class
        this.element.classList.add('token-balance');

        // Coin shape
        this.coin = document.createElement('div');
        this.coin.classList.add('token-image');
        this.element.append(this.coin);

        // ICP logo
        if (this.canisterId == args.app.ICP_LEDGER_CANISTER_ID) {
            this.coin.style.backgroundImage = `url('assets/icp-logo.svg')`;
        }
        // Load cached token image
        else (async () => {
            try {
                const image = await loadImage(`token:${this.canisterId}`);
                this.coin.style.backgroundColor = 'transparent';
                // SVG
                if (image.startsWith('<svg')) {
                    this.coin.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(image)}')`;
                }
                // Raster
                else {
                    this.coin.style.backgroundImage = `url('${image}')`;
                }
            }

            // Fallback text
            catch(error) {
                this.coin.innerText = this.wallet.tokens[this.canisterId].symbol;
            }
        })();

    }

}
