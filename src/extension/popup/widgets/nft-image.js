/**
 * NFT miniature image
 */

import { Component } from '/src/utils/component.js';
import { sanitizeSVG } from '/src/utils/general.js';

export class NFTImage extends Component {

    /**
     * Constructor
     * All Component params supported
     * @param {string} canisterId NFT collection canister ID
     * @param {string} nftId NFT ID
     */

    constructor(args) {
        super(args);

        // Coin shape
        this.element.classList.add('nft-image');

        // Load cached NFT image
        (async () => {
            try {
                const image = await this.app.cache.image.load(`nft:${args.canisterId}:${args.nftId}`);
                this.element.innerHTML = sanitizeSVG(image);
                /*
                // SVG
                if (image.startsWith('<svg') || image.startsWith('<?xml')) {
                    const dataUrl = `data:image/svg+xml;base64,${btoa(sanitizeSVG(image))}`;
                    this.element.style.backgroundImage = `url('${dataUrl}')`;
                }
                // Raster
                else {
                    this.element.style.backgroundImage = `url('${image}')`;
                }*/
            }

            // Fallback icon
            catch(error) {
                this.element.style.backgroundImage = `url('assets/material-design-icons/image.svg')`;
            }
        })();

    }

}
