import { Component } from '../Boost.js';


export class Button extends Component {

    constructor(args) {
        super({...args, create: 'button'});

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


export class Butticon extends Button {

    constructor(args) {
        super({...args, create: 'button'});

        // Build
        this.element.classList.add('butticon');
        this.element.innerHTML = args.icon + args.text;

    }

}


export class ButtonDescription extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('button-description');
        this.element.innerHTML = args.text;

    }

}
