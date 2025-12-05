/**
 * Page: Home main page
 */

import { Component } from '/src/utils/component.js';

export class PageHome extends Component {

    constructor(args) {
        super(args);

        const header1 = document.createElement('h3');
        header1.textContent = 'Home Page';
        this.element.append(header1);
        const header1sub = document.createElement('h4');
        header1sub.textContent = 'Welcome to the Home Page!';
        this.element.append(header1sub);
    }
}