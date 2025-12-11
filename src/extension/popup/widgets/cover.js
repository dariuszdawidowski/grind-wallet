/**
 * NFT thumbnail cover widget
 */

import { Component } from '/src/utils/component.js';
import { NFTImage } from '/src/extension/popup/widgets/nft-image.js';

export class Cover extends Component {

    constructor({ app, nft, click = null }) {
        super({ app });

        // NFT info
        this.nft = nft;

        // Class
        this.element.classList.add('cover');

        // Click (with distance preventing scroll)
        this.clicked = {
            x: 0,
            y: 0,
            distance: function(x2, y2) {
                const dx = x2 - this.x;
                const dy = y2 - this.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
        };
        if (click) {
            this.element.addEventListener('mousedown', (event) => {
                this.clicked.x = event.x;
                this.clicked.y = event.y;
            });
            this.element.addEventListener('mouseup', (event) => {
                if (this.clicked.distance(event.x, event.y) <= 10) click();
            });
        }

        // Load cached image
        const miniature = new NFTImage({
            app: this.app,
            canisterId: this.nft.collection,
            nftId: this.nft.id
        });
        this.element.append(miniature.element);

    }

}
