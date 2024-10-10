import { Component } from '../Boost.js';


export class Form extends Component {

    constructor(args) {
        super({...args, create: 'form'});

        // Build
        this.element.id = args.id;

        // Prevent submit
        this.submitCallback = (event) => {
            event.preventDefault();
        };
        document.body.addEventListener('submit', this.submitCallback.bind(this));
    }

    destructor() {
        super.destructor();
        document.body.removeEventListener('submit', this.submitCallback.bind(this));
    }

}
