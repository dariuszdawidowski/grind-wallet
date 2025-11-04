/**
 * Token box for swap
 */

import { Component } from '/src/utils/component.js';

export class TokenBox extends Component {

    constructor(args) {
        super(args);

        // Class
        this.element.classList.add('token-box');

        // Token selector
        this.selector = document.createElement('div');
        this.selector.classList.add('select');
        this.element.append(this.selector);

        // Token icon image
        const icon = document.createElement('img');
        icon.src = `assets/tokens/${args.selected}.svg`;
        this.selector.append(icon);

    }

}
