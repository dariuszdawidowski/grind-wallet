import { Component } from '/src/utils/component.js';

export class Form extends Component {

    constructor(args = {}) {
        super({...args, type: 'form'});

        // Build
        this.element.setAttribute('action', '#');
        this.element.setAttribute('method', 'POST');
        this.element.setAttribute('autocomplete', 'on');

        // Prevent submit
        this.submitCallback = (event) => {
            event.preventDefault();
        };
        document.body.addEventListener('submit', this.submitCallback.bind(this));
    }

}
