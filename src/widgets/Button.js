import { Component } from '../Boost.js';


/**
 * Default button
 * args:
 *   app: reference to the main app
 *   id: unique idientifier
 *   text: display
 *   click: callback
 *   enter: submit on enter (default false)
 */

export class Button extends Component {

    constructor(args) {
        super({...args, create: 'button'});

        // Build
        this.element.id = args.id;
        this.element.setAttribute('type', 'submit');

        // Text
        this.text = document.createElement('span');
        this.text.classList.add('text');
        this.text.innerHTML = args.text;
        this.element.append(this.text);

        // Spinner
        this.spinner = document.createElement('div');
        this.spinner.classList.add('spinner');
        this.text.append(this.spinner);

        // Events
        this.event.on({
            id: `button:${this.element.id}`,
            type: 'click',
            callback: args.click
        });

        // Enter key to submit
        this.enterCallback = null;
        if ('enter' in args && args.enter == true) {
            this.enterCallback = (event) => {
                if (event.key == 'Enter') args.click();
            };
            document.body.addEventListener('keyup', this.enterCallback.bind(this));
        }
    }

    destructor() {
        super.destructor();
        if (this.enterCallback) {
            document.body.removeEventListener('keyup', this.enterCallback.bind(this));
        }
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
        super({...args, create: 'button'});

        // Build
        this.element.classList.add('butticon');
        this.element.innerHTML = args.icon + args.text;

    }

}


/**
 * Link-like button
 * args:
 *   app: reference to the main app
 *   id: unique idientifier
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
        this.event.on({
            id: `button:${this.element.id}`,
            type: 'click',
            callback: args.click
        });

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
