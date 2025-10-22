import { Component } from '/src/utils/component.js';

export class AddPlus extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('add-circle');
        this.element.innerHTML = `
            <div class="plus"><img src="assets/material-design-icons/plus.svg"></img></div>
            <div class="label">${args.text}</div>
        `;

        // Events
        this.element.addEventListener('click', args.click);

    }
    
}
