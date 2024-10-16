import { Component } from '../Boost.js';
import { validCurrency } from '../utils/Currency.js';


export class InputPassword extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.id = args.id;
        this.element.classList.add('input-password');

        this.input = document.createElement('input');
        this.input.setAttribute('type', 'password');
        this.input.setAttribute('name', 'password');
        this.input.setAttribute('autocomplete', 'current-password');
        this.input.setAttribute('required', '');
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

    get() {
        return this.input.value;
    }

    valid() {

        const amount = this.get();

        if (!/^\d+(\.\d{1,8})?$/.test(amount)) {
            return false;
        }

        const num = parseFloat(amount);

        if (num <= 0) {
            return false;
        }

        return true;

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

    get() {
        return this.input.value;
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
        if (('readonly' in args) && args.readonly == true) this.input.readOnly = true;
        this.element.append(this.input);

        if (('value' in args) && args.value != null) this.set(args.value);
    }

    set(value) {
        this.input.value = value;
    }

    get() {
        return this.input.value.trim();
    }

}


export class RecoveryPhrase extends Component {

    constructor(args) {
        super(args);

        // Priovided phrase
        this.phrase = ('phrase' in args) ? args.phrase.split(' ') : [];

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
                nr,
                readonly: ('readonly' in args) ? args.readonly : false,
                value: this.phrase.length ? this.phrase[nr - 1] : null
            });
            this.inputs.push(input);
            this.append(input);
        }

        // Detect paste
        this.paste = (event) => {
            event.preventDefault();
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            const words = pastedText.trim().split(/\s+/);
            if (words.length === 12) {
                this.inputs.forEach((input, index) => {
                    input.set(words[index]);
                });
            }
            else {
                this.inputs[0].set(pastedText);
            }
        };

        this.inputs[0].input.addEventListener('paste', this.paste.bind(this));

    }

    destructor() {
        this.inputs[0].input.removeEventListener('paste', this.paste.bind(this));
    }

    get() {
        const phrase = [];
        this.inputs.forEach(input => {
            phrase.push(input.get());
        });
        return phrase;
    }

}
