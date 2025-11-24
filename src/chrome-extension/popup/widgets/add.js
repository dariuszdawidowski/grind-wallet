/**
 * Plus icon
 */

import { Component } from '/src/utils/component.js';

export class AddPlus extends Component {

    constructor({ text = null, click = null }) {
        super();

        // Build
        this.element.classList.add('add-circle');
        let html = '<div class="plus"><img src="assets/material-design-icons/plus.svg"></img></div>';
        if (text) html += `<div class="label">${text}</div>`;
        this.element.innerHTML = html;

        // Events
        this.element.addEventListener('click', click);
    }
    
}
