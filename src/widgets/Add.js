import { Component } from '/src/utils/Component.js';


export class AddPlus extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('add-coin');
        this.element.innerHTML = `
            <div class="plus"><img src="assets/material-design-icons/plus.svg"></img></div>
            <div class="label">${args.text}</div>
        `;

        // Events
        this.element.addEventListener('click', args.click);

    }
    
}
