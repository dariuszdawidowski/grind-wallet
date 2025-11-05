/**
 * Transaction summary box
 */

import { Component } from '/src/utils/component.js';

export class Summary extends Component {

    constructor({ app = null, text = null } = {}) {
        super({ app });

        // Build
        this.element.classList.add('summary-box');
        if (text) this.element.innerHTML = text;

    }

    /**
     * Add or update row value
     */

    row(title, text) {
        const rowElement = this.element.querySelector(`[data-title="${title}"]`);
        if (rowElement) {
            rowElement.innerHTML = `<b>${title}</b>: ${text}`;
        }
        else {
            this.element.innerHTML += `<div data-title="${title}" class="summary-row"><b>${title}</b>: ${text}</div>`;
        }
    }

}
