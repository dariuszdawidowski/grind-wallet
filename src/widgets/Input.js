import { Component } from '/src/utils/Component.js';
const bip39 = require('bip39');


/**
 * Input for generic text
 */

export class InputText extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('input-text');

        this.input = document.createElement('input');
        if ('value' in args) {
            this.input.value = args.value;
        }
        if ('focus' in args) this.input.setAttribute('autofocus', 'true');
        if ('placeholder' in args) this.input.placeholder = args.placeholder;
        this.element.append(this.input);

    }

    set(value) {
        this.input.value = value;
    }

    get() {
        return this.input.value.trim();
    }

    enable() {
        this.input.disabled = false;
        this.element.classList.remove('dimed');
    }

    disable() {
        this.input.disabled = true;
        this.element.classList.add('dimed');
    }

}


/**
 * Input for password
 */

export class InputPassword extends InputText {

    constructor(args) {
        super(args);
        this.input.setAttribute('type', 'password');
        this.input.setAttribute('name', 'password');
        this.input.setAttribute('autocomplete', 'current-password');
    }

}


/**
 * Input for currency
 */

export class InputCurrency extends InputText {

    constructor(args) {
        super(args);

        this.element.classList.add('input-currency');

        if ('symbol' in args) {
            const symbol = document.createElement('div');
            symbol.innerHTML = args.symbol;
            this.element.append(symbol);
        }

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

/**
 * Input for Principal ID or Account ID
 */

export class InputAddress extends InputText {

    constructor(args) {
        super(args);

        this.element.classList.add('input-account');
    }

    detect() {
        if (this.get().search('-') != -1) return 'principal';
        else return 'account';
    }

}


/**
 * Input for pass phrase
 */

export class InputPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
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


/**
 * Block of multiple InputPhrases
 */

export class RecoveryPhrase extends Component {

    constructor(args) {
        super(args);

        // Priovided phrase
        this.phrase = ('phrase' in args) ? args.phrase.split(' ') : [];

        // Build
        this.element.classList.add('input-recovery');

        // Inputs
        this.number = args.number;
        this.inputs = [];
        for (let nr = 1; nr < this.number + 1; nr ++) {
            const input = new InputPhrase({
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

    get() {
        const phrase = [];
        this.inputs.forEach(input => {
            phrase.push(input.get());
        });
        return phrase;
    }

    valid() {

        const phrase = this.get();
        const mnemonic = phrase.join(' ');

        // 12 words
        if (phrase.length !== 12) return false;

        // BIP-39 built-in validator
        if (!bip39.validateMnemonic(mnemonic)) return false;

        return true;
    }

}
