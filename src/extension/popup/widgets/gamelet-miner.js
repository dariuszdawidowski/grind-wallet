/**
 * Gamelet: "Miner" widget
 */

import { Gamelet } from '/src/extension/popup/widgets/gamelet.js';

export class GameletMiner extends Gamelet {

    /**
     * Constructor
     * @param {object} args.app - application instance
     */

    constructor(args) {
        super(args);

        // Title
        // const title = document.createElement('div');
        // title.classList.add('title');
        // title.textContent = 'Miner';
        // this.element.append(title);

        // Rock image
        const img = document.createElement('img');
        img.src = 'assets/sprites/rock-base.png';
        img.style.marginTop = '26px';
        img.style.marginLeft = '26px';
        this.element.append(img);
    }

}