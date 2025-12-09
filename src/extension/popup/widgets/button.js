/**
 * Default button
 * Component args:
 *   id: unique idientifier (optional)
 *   classList: additional classes (optional)
 *   app: reference to the main app (optional)
 * Constructor args:
 *   icon: icon html (optional)
 *   text: display
 *   click: callback
 *   enter: submit on enter (default false)
 *   disabled: initially disabled (default false)
 */

import { Component } from '/src/utils/component.js';

export class Button extends Component {

    constructor(args) {
        super({...args, type: 'button'});

        // State machine (used to advance next stage)
        this.state = 0;

        // Build
        this.element.setAttribute('type', 'submit');

        // Icon
        if ('icon' in args) {
            this.icon = document.createElement('span');
            this.icon.classList.add('icon');
            this.icon.innerHTML = args.icon;
            this.element.append(this.icon);
        }

        // Text
        this.text = document.createElement('span');
        this.text.classList.add('text');
        this.text.innerHTML = args.text;
        this.element.append(this.text);

        // Spinner
        this.spinner = document.createElement('div');
        this.spinner.classList.add('spinner');
        this.text.append(this.spinner);

        // Enter key to submit
        this.enterCallback = null;
        if (('enter' in args) && args.enter == true) {
            this.enterCallback = (event) => {
                if (event.key == 'Enter') args.click();
            };
            document.body.addEventListener('keyup', this.enterCallback.bind(this));
        }

        // Optionally disable
        if (('disabled' in args) && args.disabled == true) this.disable();
    }

    busy(show = true) {
        if (show) {
            this.spinner.style.display = 'block';
            this.element.disabled = true;
        }
        else {
            this.spinner.style.display = 'none';
            this.element.disabled = false;
        }

    }

    set(text) {
        this.text.innerHTML = text;
    }

    get() {
        return this.text.innerHTML;
    }

    enable() {
        this.element.disabled = false;
        this.element.classList.remove('dimed');
    }

    disable() {
        this.element.disabled = true;
        this.element.classList.add('dimed');
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }

}


/**
 * Square icon button
 * args:
 *   app: reference to the main app
 *   id: unique idientifier
 *   text: display
 *   click: callback
 *   enter: submit on enter (default false)
 */

export class ButtIcon extends Button {

    constructor(args) {
        super({...args, type: 'button'});

        // Icon
        this.icon = args.icon;

        // Build
        this.element.classList.add('butticon');
        this.set(args.text);

    }

    set(text) {
        this.element.innerHTML = this.icon + text;
    }

}


/**
 * Link-like button
 * args:
 *   text: display
 */

export class ButtLink extends Component {

    constructor(args) {
        super(args);

        this.icon = ('icon' in args) ? args.icon : '→';

        // Build
        this.element.classList.add('buttlink');
        this.set(args.text);

    }

    set(text) {
        this.element.innerHTML = text + ' ' + this.icon;
    }

}


/**
 * Non-interactive description under button
 * args:
 *   app: reference to the main app
 *   id: unique idientifier
 *   text: display
 */

export class ButtonDescription extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('button-description');
        this.set(args.text);

    }

    set(text) {
        this.element.innerHTML = text;
    }

}
