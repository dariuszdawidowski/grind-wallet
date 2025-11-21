/**
 * Address Book
 */

import { Component } from '/src/utils/component.js';

export class AddressBook extends Component {

    constructor(args) {
        super(args);

        // CSS class
        this.element.classList.add('address-book');

        this.element.innerHTML = 'ADDRESS BOOK';
    }    
}
