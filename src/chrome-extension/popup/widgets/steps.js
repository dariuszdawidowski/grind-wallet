/**
 * Numbered steps box widget
 */

import { Component } from '/src/utils/component.js';

export class StepsBox extends Component {

    constructor({ app = null } = {}) {
        super({ app });

        // Build
        this.element.classList.add('steps-box');

    }

    /**
     * Add or update step
     */

    step(nr, html) {
        const stepContent = this.element.querySelector(`.step[data-nr="${nr}"] .step-content`);
        if (stepContent) {
            stepContent.innerHTML = html;
        }
        else {
            this.element.innerHTML += `<div data-nr="${nr}" class="step"><div class="step-nr">${nr}</div><div class="step-content">${html}</div></div>`;
        }
    }

}
