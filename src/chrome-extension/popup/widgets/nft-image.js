/**
 * NFT miniature image
 */

import { Component } from '/src/utils/component.js';
import { loadImage } from '/src/utils/image-cache.js';

export class NFTImage extends Component {

    constructor({ app, canisterId, nftId }) {
        super({ app });

        // Coin shape
        this.element.classList.add('nft-image');

        // Load cached NFT image
        (async () => {
            try {
                const image = await loadImage(`nft:${canisterId}:${nftId}`);
                this.element.innerHTML = image;
            }

            // Fallback icon
            catch(error) {
                this.element.style.backgroundImage = `url('assets/material-design-icons/image.svg')`;
            }
        })();

    }

}
