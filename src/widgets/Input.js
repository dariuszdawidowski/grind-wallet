import { Component } from '../Boost.js';


export class InputPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('phrase');

        const number = document.createElement('div');
        number.innerText = `${args.nr}.`;
        this.element.append(number);

        this.input = document.createElement('input');
        this.element.append(this.input);

    }

}


export class RecoveryPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('recovery');

        // Inputs
        this.number = args.number;
        this.inputs = [];
        for (let nr = 1; nr < this.number + 1; nr ++) {
            const input = new InputPhrase({
                app: args.app,
                id: `phrase-${nr}`,
                nr
            });
            this.inputs.push(input);
            this.append(input);
        }


    }

}
