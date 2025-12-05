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

}