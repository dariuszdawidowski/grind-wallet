import { Component } from './Boost.js';


export class Button extends Component {

    constructor(args) {
        super(args.app, 'button');

        // Build
        this.element.id = args.id;
        this.element.innerHTML = args.text;

        // Events
        this.event.on({
            id: `button:${this.element.id}`,
            type: 'click',
            callback: args.click
        });

    }

}
