/**
 * NFT thumbnail cover widget
 */

import { Component } from '/src/utils/component.js';
import { loadImage } from '/src/utils/image-cache.js';

export class Cover extends Component {

    constructor({ wallet, nft, click = null }) {
        super({});

        // Wallet reference
        this.wallet = wallet;

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
        (async () => {
            try {
                const image = await loadImage(`nft:${this.nft.collection}:${this.nft.id}`);
                this.element.style.backgroundColor = 'transparent';
                this.element.innerHTML = `${image}`;
            }

            // Fallback box
            catch(error) {
                console.error(error);
            }
        })();

    }

}
