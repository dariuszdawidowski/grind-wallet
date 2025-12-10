/**
 * Gamelet base widget
 */

import { Component } from '/src/utils/component.js';

export class Gamelet extends Component {

    /**
     * Constructor
     * @param {object} args.app - application instance
     */

    constructor(args) {
        super(args);

        // Style
        this.element.classList.add('tile', 'square', 'gamelet');
    }

    /**
     * Enable sprite animation
     */

    anim(element, animation, speed = 0.5, timeout = 500) {
        if (element.style.animation == '') {
            element.style.animation = `${animation} ${speed}s`;
            setTimeout(() => {
                element.style.animation = '';
            }, timeout);
        }
    }

}