import { Component } from '/src/utils/component.js';
import { Principal } from "@icp-sdk/core/principal";
import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp";
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
 *   icon: string (optional) - HTML for right-side icon
 *   focus: boolean (optional) - if true, set the autofocus attribute
 *   autocomplete: array (optional) - array of strings for autocomplete suggestions
 *   onKeypress: func (optional) - callback on key pressed
 *   onIconClick: func (optional) - callback when icon is clicked
 *   onChange: func (optional) - callback on input change
 *   onFocus: func (optional) - callback on input focus
 *   onBlur: func (optional) - callback on input blur
 */

export class InputText extends Component {

    constructor(args) {
        super(args);

        // Real value (used by impostor)
        this.realValue = null;

        // Autocomplete suggestions
        this.autocompleteList = ('autocomplete' in args) ? args.autocomplete : null;

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

        // Setup autocomplete
        if (this.autocompleteList) {
            this.setupAutocomplete();
        }

        // Optional keypress callback
        if ('onKeypress' in args) {
            this.input.addEventListener('input', (event) => {
                args.onKeypress({ key: event.data, value: this.input.value });
            });
        }

        // Optional change callback
        this.onChangeCallback = ('onChange' in args) ? args.onChange : null;
        if (this.onChangeCallback) {
            this.input.addEventListener('change', (event) => {
                this.onChangeCallback({ value: this.input.value });
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

        // On focus input
        this.input.addEventListener('focus', (event) => {
            if ('onFocus' in args) args.onFocus({ value: this.input.value });
        });

        // On blur input
        this.input.addEventListener('blur', (event) => {
            if ('onBlur' in args) args.onBlur({ value: this.input.value });
        });

    }

    /**
     * Setup autocomplete functionality
     */

    setupAutocomplete() {

        // Create ghost input for inline suggestions
        this.ghostInput = document.createElement('input');
        this.ghostInput.classList.add('ghost-input');
        this.ghostInput.setAttribute('readonly', 'true');
        this.ghostInput.setAttribute('tabindex', '-1');
        this.element.insertBefore(this.ghostInput, this.input.nextSibling);

        // Store current match
        this.currentMatch = null;

        // Handle input changes
        this.input.addEventListener('input', () => {
            const value = this.input.value;
            this.ghostInput.value = '';
            this.currentMatch = null;
            
            if (!value) return;
            
            // Find first matching suggestion (case-insensitive)
            const match = this.autocompleteList.find(item => 
                item.toLowerCase().startsWith(value.toLowerCase()) && item.toLowerCase() !== value.toLowerCase()
            );
            
            if (match) {
                // Keep the same case as user input for matching part
                this.ghostInput.value = value + match.slice(value.length);
                // Store original match for acceptance
                this.currentMatch = match;
            }
        });

        // Handle Tab key to accept suggestion
        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Tab' && this.ghostInput.value && this.currentMatch) {
                event.preventDefault();
                this.input.value = this.currentMatch;
                this.ghostInput.value = '';
                this.currentMatch = null;
                if (this.onChangeCallback) this.onChangeCallback({ value: this.input.value });
            }
            // Handle Right Arrow key to accept suggestion
            else if (event.key === 'ArrowRight' && this.input.selectionStart === this.input.value.length && this.ghostInput.value && this.currentMatch) {
                event.preventDefault();
                this.input.value = this.currentMatch;
                this.ghostInput.value = '';
                this.currentMatch = null;
                if (this.onChangeCallback) this.onChangeCallback({ value: this.input.value });
            }
        });

        // Clear ghost on blur
        this.input.addEventListener('blur', () => {
            setTimeout(() => {
                this.ghostInput.value = '';
                this.currentMatch = null;
            }, 100);
        });
    }

    /**
     * Set value
     * @param value - string
     * or
     * @param value - { real: string, impostor: string }
     */

    set(value) {
        // Direct value
        if (typeof(value) == 'string') {
            this.input.value = value;
        }

        // Impostor value (used to show different text than actual input value)
        else if (typeof(value) == 'object') {
            if ('real' in value) this.realValue = value.real;
            else this.realValue = this.input.value;
            if ('impostor' in value) this.input.value = value.impostor;
        }
    }

    /**
     * Reset impostor value
     */

    resetImpostor() {
        if (this.realValue !== null) this.input.value = this.realValue;
        this.realValue = null;
    }

    /**
     * Get sanitized value
     */

    get() {
        const value = this.realValue ? this.realValue : this.input.value;
        const normalized = value.normalize('NFC');
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

    /**
     * Enable interaction
     */

    enable() {
        this.input.disabled = false;
        this.element.classList.remove('dimed');
    }

    /**
     * Disable interaction
     */

    disable() {
        this.input.disabled = true;
        this.element.classList.add('dimed');
    }

    /**
     * Set text color
     */

    color(value = null) {
        if (value) this.input.style.color = value;
        else this.input.style.removeProperty('color');
    }

    /**
     * Validator
     */

    valid() {
        return this.get().length > 0;
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

    /**
     * Detect type
     */

    detect() {
        if (this.get().search('-') != -1) return 'principal';
        else return 'account';
    }

    /**
     * Validator
     */

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

    /**
     * Set value
     */

    set(value) {
        this.input.value = value;
    }

    /**
     * Get value
     */

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

    /**
     * Get phrase as array
     */

    get() {
        const phrase = [];
        this.inputs.forEach(input => {
            phrase.push(input.get());
        });
        return phrase;
    }

    /**
     * Validator
     */

    valid() {

        // Check if all inputs are valid (non-empty)
        if (!this.inputs.every(input => input.get().length > 0)) return false;

        // Get phrase
        const phrase = this.get();
        const mnemonic = phrase.join(' ');

        // 12 words
        if (phrase.length !== 12) return false;

        // BIP-39 built-in validator
        if (!bip39.validateMnemonic(mnemonic)) return false;

        return true;
    }

}
