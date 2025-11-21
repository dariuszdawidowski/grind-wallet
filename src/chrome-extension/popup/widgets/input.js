import { Component } from '/src/utils/component.js';
import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
const bip39 = require('bip39');

/**
 * Input for generic text
 *
 * Component args:
 *   id: unique idientifier (optional)
 *   classList: additional classes (optional)
 *   app: reference to the main app (optional)
 * Constructor args:
 *   value: string (optional) - initial value to populate the input
 *   placeholder: string (optional) - placeholder text shown when empty
 *   focus: boolean (optional) - if true, set the autofocus attribute
 *   onKeypress: func (optional) - callback on key pressed
 *   icon: string (optional) - HTML for right-side icon
 *   onIconClick: func (optional) - callback when icon is clicked
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
        this.input.setAttribute('spellcheck', 'false');
        if ('focus' in args) this.input.setAttribute('autofocus', 'true');
        if ('placeholder' in args) this.input.placeholder = args.placeholder;
        this.element.append(this.input);

        // Optional keypress callback
        if ('onKeypress' in args) {
            this.input.addEventListener('input', (event) => {
                args.onKeypress({ key: event.data, value: this.input.value });
            });
        }

        // Optional right-side icon
        if ('icon' in args) {
            this.icon = document.createElement('div');
            this.icon.classList.add('input-icon');
            this.icon.innerHTML = args.icon;
            this.element.append(this.icon);
            if ('onIconClick' in args) this.icon.addEventListener('click', args.onIconClick);
        }

    }

    set(value) {
        this.input.value = value;
    }

    get() {
        const normalized = this.input.value.normalize('NFC');
        const sanitized = Array.from(normalized).filter((char) => {
            const codePoint = char.codePointAt(0);
            if (codePoint === undefined) return false;
            if (codePoint <= 31) return false;
            if (codePoint >= 127 && codePoint <= 159) return false;
            if (codePoint >= 0xD800 && codePoint <= 0xDFFF) return false;
            return true;
        }).join('');
        return sanitized.trim();
    }

    enable() {
        this.input.disabled = false;
        this.element.classList.remove('dimed');
    }

    disable() {
        this.input.disabled = true;
        this.element.classList.add('dimed');
    }

    color(value = null) {
        if (value) this.input.style.color = value;
        else this.input.style.removeProperty('color');
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
 *
 * Constructor args:
 *  - symbol: string (optional) - currency symbol markup (used by InputCurrency)
 *  - note: string (optional) - text below value
 */

export class InputCurrency extends InputText {

    constructor(args) {
        super(args);

        this.element.classList.add('input-currency');

        // Set numeric input pattern
        this.input.setAttribute('type', 'number');
        this.input.setAttribute('pattern', '[0-9]*');
        this.input.setAttribute('inputmode', 'decimal');

        this.annotation = null;

        if ('symbol' in args) {
            const symbol = document.createElement('div');
            symbol.innerHTML = args.symbol;
            this.element.append(symbol);
        }

        if ('note' in args) this.note(args.note);

    }

    /**
     * Annotation
     */

    note(text) {
        if (!this.annotation) {
            this.annotation = document.createElement('div');
            this.annotation.classList.add('note');
            this.element.append(this.annotation);
        }
        this.annotation.innerHTML = text;
    }

    /**
     * Validator
     */

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

    valid() {
        const type = this.detect();
        if (type == 'principal') {
            try {
                Principal.fromText(this.get());
            }
            catch {
                return false;
            }
            return true;
        }
        else if (type == 'account') {
            try {
                AccountIdentifier.fromHex(this.get());
            }
            catch (error) {
                return false;
            }
            return true;
        }
        return false;
    }

}


/**
 * Input for pass phrase
 *
 * Constructor args:
 *  - nr: number (optional) - index number for phrase inputs
 *  - value: string (optional) - initial value to populate the input
 *  - readonly: boolean (optional) - if true, make the input read-only
 *
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
 * 
 * Constructor args:
 *  - phrase: string (optional) - paste phrase
 *  - number: number (optional) - number of phrase inputs
 *  - readonly: boolean (optional) - if true, make the input read-only
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
