import { Component } from '../Boost.js';


export class Card extends Component {

    constructor(args) {
        super(args.app);

        // Build
        this.element.id = args.id;
        this.element.classList.add('card');

    }

}
