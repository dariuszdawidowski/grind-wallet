/**
 * Plus icon
 */

import { Component } from '/src/utils/component.js';

export class AddPlus extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('add-circle');

        const plus = document.createElement('div');
        plus.classList.add('plus');

        const icon = document.createElement('img');
        icon.src = 'assets/material-design-icons/plus.svg';
        plus.append(icon);

        this.element.append(plus);

        if ('text' in args) {
            const label = document.createElement('div');
            label.classList.add('label');
            label.textContent = args.text;
            this.element.append(label);
        }
    }
    
}
