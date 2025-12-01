/**
 * Arrow widget
 */

import { Component } from '/src/utils/component.js';

export class Arrow extends Component {

    constructor({ app = null, direction = 'down' } = {}) {
        super({ app });

        // Build
        this.element.classList.add('exchange-arrow');
        const arrowContent = document.createElement('div');
        arrowContent.classList.add('arrow-content');
        arrowContent.style.backgroundImage = `url('assets/material-design-icons/arrow-${direction}-bold.svg')`;
        this.element.append(arrowContent);

    }

}
