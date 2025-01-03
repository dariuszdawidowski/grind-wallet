import { Component } from '/src/utils/Component.js';
import { Button, ButtIcon, ButtLink } from '/src/widgets/Button.js';
import { loadImage } from '/src/utils/ImageCache.js';

export class SheetNFTDetails extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // NFT info
        this.nft = args.nft;

        // Build
        this.element.classList.add('form');

    }

    update() {
    }

}

