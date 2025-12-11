/**
 * Token icon image
 */

import { Component } from '/src/utils/component.js';
import { sanitizeSVG } from '/src/utils/general.js';

export class TokenImage extends Component {

    /**
     * Constructor
     * @param {object} app App reference
     * @param {string} canisterId Token Ledger canister ID
     * @param {string} symbol Token symbol (optional)
     */

    constructor({ app, canisterId, symbol = null }) {
        super({ app });

        // Coin shape
        this.element.classList.add('token-image');

        // ICP logo
        if (canisterId == app.ICP_LEDGER_CANISTER_ID) {
            this.element.style.backgroundImage = `url('assets/tokens/icp.svg')`;
        }
        // Load cached token image
        else (async () => {
            try {
                const image = await this.app.cache.image.load(`token:${canisterId}`);
                if (image) {
                    this.element.style.backgroundColor = 'transparent';
                    // SVG
                    if (image.startsWith('<svg') || image.startsWith('<?xml')) {
                        this.element.innerHTML = sanitizeSVG(image);
                    }
                    // Raster
                    else {
                        this.element.style.backgroundImage = `url('${image}')`;
                    }
                }
                // Fallback placeholder
                else {
                    if (symbol) this.element.innerText = symbol;
                }
            }

            // Fallback placeholder
            catch(error) {
                if (symbol) this.element.innerText = symbol;
            }
        })();

    }

}
