/**
 * Token icon image
 */

import { Component } from '/src/utils/component.js';

export class TokenImage extends Component {

    constructor({ app, canisterId, symbol }) {
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
                    if (image.startsWith('<svg')) {
                        this.element.innerHTML = image;
                    }
                    // Raster
                    else {
                        this.element.style.backgroundImage = `url('${image}')`;
                    }
                }
                // Fallback placeholder
                else {
                    this.element.innerText = symbol;
                }
            }

            // Fallback placeholder
            catch(error) {
                this.element.innerText = symbol;
            }
        })();

    }

}
