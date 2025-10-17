import { Component } from '/src/utils/Component.js';


/**
 * Default button
 * args:
 *   id: unique idientifier (optional)
 *   text: display
 *   click: callback
 *   enter: submit on enter (default false)
 *   disabled: initially disabled (default false)
 */

export class Button extends Component {

    constructor(args) {
        super({...args, type: 'button'});

        // State machine (used to advance next stage)
        this.state = 0;

        // Build
        this.element.setAttribute('type', 'submit');

        // Text
        this.text = document.createElement('span');
        this.text.classList.add('text');
        this.text.innerHTML = args.text;
        this.element.append(this.text);

        // Spinner
        this.spinner = document.createElement('div');
        this.spinner.classList.add('spinner');
        this.element.append(this.spinner);

        // Events
        this.element.addEventListener('click', args.click);

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

        // Build
        this.element.classList.add('butticon');
        this.element.innerHTML = args.icon + args.text;

    }

}


/**
 * Link-like button
 * args:
 *   text: display
 *   click: callback
 */

export class ButtLink extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('buttlink');
        this.element.innerHTML = args.text + ' →';

        // Events
        this.element.addEventListener('click', args.click);

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
        this.element.innerHTML = args.text;

    }

}
