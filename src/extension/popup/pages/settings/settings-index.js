/**
 * Page: Settings page
 */

import { Component } from '/src/utils/component.js';

export class PageSettings extends Component {

    constructor(args) {
        super(args);

        const header1 = document.createElement('h3');
        header1.textContent = 'Settings Page';
        this.element.append(header1);
        const header1sub = document.createElement('h4');
        header1sub.textContent = 'Welcome to the Settings Page!';
        this.element.append(header1sub);

    }
}