import { Component } from '../Boost.js';


export class InputPhrase extends Component {

    constructor(args) {
        super(args.app, 'input');

        // Build
        this.element.id = args.id;
        this.element.classList.add('phrase');

    }

}
