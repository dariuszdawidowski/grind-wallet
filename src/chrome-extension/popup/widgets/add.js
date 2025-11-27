/**
 * Plus icon
 */

import { Component } from '/src/utils/component.js';

export class AddPlus extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('add-circle');
        let html = '<div class="plus"><img src="assets/material-design-icons/plus.svg"></img></div>';
        if ('text' in args) html += `<div class="label">${args.text}</div>`;
        this.element.innerHTML = html;
    }
    
}
