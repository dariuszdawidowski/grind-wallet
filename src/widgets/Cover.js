import { Component } from '/src/utils/Component.js';
import { loadImage } from '/src/utils/ImageCache.js';

export class Cover extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // NFT info
        this.nft = args.nft;

        // Class
        this.element.classList.add('cover');

        // Click (with distance preventing scroll)
        this.click = {
            x: 0,
            y: 0,
            distance: function(x2, y2) {
                const dx = x2 - this.x;
                const dy = y2 - this.y;
                return Math.sqrt(dx * dx + dy * dy);
            }
        };
        if ('click' in args) {
            this.element.addEventListener('mousedown', (event) => {
                this.click.x = event.x;
                this.click.y = event.y;
            });
            this.element.addEventListener('mouseup', (event) => {
                if (this.click.distance(event.x, event.y) <= 10) args.click();
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
