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
        this.element.innerHTML = args.text;

        // Events
        this.event.on({
            id: `button:${this.element.id}`,
            type: 'click',
            callback: args.click
        });

        // Enter key to submit
        this.enterCallback = null;
        if ('enter' in args) {
            this.enterCallback = (event) => {
                if (event.key == 'Enter') this.element.click();
            };
            document.body.addEventListener('keydown', this.enterCallback.bind(this));
        }
    }

    destructor() {
        super.destructor();
        if (this.enterCallback) {
            document.body.removeEventListener('keydown', this.enterCallback.bind(this));
        }
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

export class Butticon extends Button {

    constructor(args) {
        super({...args, create: 'button'});

        // Build
        this.element.classList.add('butticon');
        this.element.innerHTML = args.icon + args.text;

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
