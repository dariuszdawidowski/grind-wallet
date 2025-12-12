/**
 * NFT miniature image
 */

import { Component } from '/src/utils/component.js';
import { sanitizeSVG } from '/src/utils/general.js';

export class NFTImage extends Component {

    /**
     * Constructor
     * All Component params supported
     * @param {string} image Image in buffer (optional)
     * or:
     * @param {string} canisterId NFT collection canister ID
     * @param {string} nftId NFT ID
     */

    constructor(args) {
        super(args);

        // Coin shape
        this.element.classList.add('nft-image');
      
        (async () => {

            // Image in buffer
            if ('image' in args) {
                await this.render(args.image);
            }

            // Load cached NFT image
            else {
                try {
                    const image = await this.app.cache.image.load(`nft:${args.canisterId}:${args.nftId}`);
                    await this.render(image);
                }

                // Fallback icon
                catch(error) {
                    this.element.style.backgroundImage = `url('assets/material-design-icons/image.svg')`;
                }
            }
        })();

    }

    /**
     * Render image
     */

    async render(image) {
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
