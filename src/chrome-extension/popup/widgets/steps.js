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

    /**
     * Mark as completed and current step
     */

    current(nr) {
        const steps = this.element.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNr = parseInt(step.getAttribute('data-nr'));
            if (stepNr < nr) {
                step.classList.add('done');
                step.classList.remove('current');
                const stepNrContent = step.querySelector('.step-nr');
                stepNrContent.innerHTML = '&#10003;';
            }
            else if (stepNr === nr) {
                step.classList.add('current');
                step.classList.remove('done');
            }
            else {
                step.classList.remove('done');
                step.classList.remove('current');
            }
        });
    }

}
