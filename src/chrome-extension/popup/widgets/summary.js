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
     * Add row
     */

    addRow(title, text) {
        this.element.innerHTML += `<div class="summary-row"><b>${title}</b>: ${text}</div>`;
    }

}
