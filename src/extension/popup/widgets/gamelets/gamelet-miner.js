/**
 * Gamelet: "Miner" widget
 */

import { Gamelet } from '/src/extension/popup/widgets/gamelets/gamelet-base.js';

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
        this.rock = document.createElement('img');
        this.rock.classList.add('sprite');
        this.rock.style.width = '128px';
        this.rock.style.height = '128px';
        this.rock.style.right = '-5px';
        this.rock.style.bottom = '-5px';
        this.rock.src = 'assets/sprites/rock-base.png';
        this.rock.style.zIndex = '9';
        this.element.append(this.rock);

        // Pick
        this.pick = document.createElement('img');
        this.pick.classList.add('sprite');
        this.pick.src = 'assets/sprites/pick.png';
        this.pick.style.width = '100px';
        this.pick.style.height = '100px';
        this.pick.style.left = '0px';
        this.pick.style.top = '0px';
        this.pick.style.zIndex = '10';
        this.element.append(this.pick);

        // Click
        this.element.addEventListener('click', () => {
            this.dig();
        });
    }

    /**
     * Digging animation frame
     */

    dig() {
        // this.pick.src = 'assets/sprites/pick-angle.png';
        this.pick.style.transform = 'rotate(45deg)';
        this.pick.style.left = '20px';
        this.pick.style.top = '20px';
        setTimeout(() => {
            // this.pick.src = 'assets/sprites/pick-up.png';
            this.pick.style.transform = 'rotate(0deg)';
            this.pick.style.left = '0px';
            this.pick.style.top = '0px';
        }, 100);
    }

}