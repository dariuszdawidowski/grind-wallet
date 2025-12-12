/**
 * Token icon image
 */

import { Component } from '/src/utils/component.js';
import { sanitizeSVG } from '/src/utils/general.js';

export class TokenImage extends Component {

    /**
     * Constructor
     * All Component params supported
     * @param {string} image Image in buffer (optional)
     * or:
     * @param {string} canisterId Token Ledger canister ID (optional)
     * @param {string} symbol Token symbol (optional)
     */

    constructor(args) {
        super(args);

        // Coin shape
        this.element.classList.add('token-image');

        (async () => {
            // Image in buffer
            if ('image' in args) {
                awaitthis.render(args.image);
            }

            // ICP logo
            else if (args.canisterId == this.app.ICP_LEDGER_CANISTER_ID) {
                this.element.style.backgroundImage = `url('assets/tokens/icp.svg')`;
            }

            // Load cached token image
            else {
                try {
                    const image = await this.app.cache.image.load(`token:${args.canisterId}`);
                    if (image) {
                        await this.render(image);
                    }
                    // Fallback placeholder
                    else {
                        if ('symbol' in args) this.element.innerText = args.symbol;
                    }
                }

                // Fallback placeholder
                catch(error) {
                    if ('symbol' in args) this.element.innerText = args.symbol;
                }
            }
        })();

    }

    /**
     * Render image
     */

    async render(image) {
        // Clear placeholder for non-square and non-cicular images
        this.element.style.backgroundColor = 'transparent';
        // SVG
        if (image.startsWith('<svg') || image.startsWith('<?xml')) {
            const dataUrl = `data:image/svg+xml;base64,${btoa(await sanitizeSVG(image))}`;
            this.element.style.backgroundImage = `url('${dataUrl}')`;
        }
        // Raster
        else {
            this.element.style.backgroundImage = `url('${image}')`;
        }
    }

}
