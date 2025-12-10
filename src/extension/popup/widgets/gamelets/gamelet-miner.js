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

        // Accumulate counter
        this.counter = 0;
        this.lastClick = 0;

        // Points
        this.points = document.createElement('div');
        this.points.classList.add('points');
        this.points.textContent = '100';
        this.element.append(this.points);

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
        const now = Date.now();
        if (now - this.lastClick < 200) this.counter++;
        else this.counter = 0;
        this.lastClick = now;
        this.pick.style.transform = 'rotate(45deg)';
        this.pick.style.left = '20px';
        this.pick.style.top = '20px';
        this.particles(this.rock, { class: 'pebble', count: 3, size: 4, duration: 500, spread: 80, offsetY: -20 });
        setTimeout(() => {
            this.pick.style.transform = 'rotate(0deg)';
            this.pick.style.left = '0px';
            this.pick.style.top = '0px';
        }, 100);
        if (this.counter <= 40) {
            this.anim(this.rock, 'shakeYlo', 0.5, 500);
            this.points.style.color = '#333';
        }
        else if (this.counter > 40 && this.counter <= 80) {
            this.anim(this.rock, 'shakeYmd', 0.5, 500);
            this.points.style.color = '#da8f05ff';
        }
        else if (this.counter > 80) {
            this.anim(this.rock, 'shakeYhi', 0.5, 500);
            this.points.style.color = '#ff0000';
        }
        this.points.textContent = `${100 - this.counter}`;
        if (this.counter == 100) {
            console.log('crashed');
            this.counter = 0;
        }
    }

}