import { Component } from '../Boost.js';


export class InputPassword extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('input-password');

        this.input = document.createElement('input');
        this.input.setAttribute('type', 'password');
        if ('focus' in args) this.input.setAttribute('autofocus', 'true');
        if ('placeholder' in args) this.input.placeholder = args.placeholder;
        this.element.append(this.input);

    }

    get() {
        return this.input.value;
    }

}


export class InputCurrency extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('input-currency');

        this.input = document.createElement('input');
        if ('placeholder' in args) this.input.placeholder = args.placeholder;
        this.element.append(this.input);

        if ('symbol' in args) {
            const symbol = document.createElement('div');
            symbol.innerHTML = args.symbol;
            this.element.append(symbol);
        }

    }

}


export class InputAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('input-account');

        this.input = document.createElement('input');
        if ('placeholder' in args) this.input.placeholder = args.placeholder;
        this.element.append(this.input);

    }

}


export class InputPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('input-phrase');

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
        this.element.classList.add('input-recovery');

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
