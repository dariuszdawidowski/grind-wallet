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
            const step = document.createElement('div');
            step.dataset.nr = nr;
            step.classList.add('step');

            const stepNr = document.createElement('div');
            stepNr.classList.add('step-nr');
            stepNr.textContent = nr;

            const stepContent = document.createElement('div');
            stepContent.classList.add('step-content');
            stepContent.innerHTML = html;

            step.append(stepNr, stepContent);
            this.element.append(step);
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
                stepNrContent.textContent = '✓';
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
