/**
 * Round progress meter widget
 */

import { Component } from '/src/utils/component.js';

export class Progress extends Component {

    constructor(args = {}) {
        super(args);

        this.element.classList.add('progress');
        this.element.style.setProperty('--progress', '0');
    }

    /**
     * Update progress value (0-100)
     * @param {number} value - Progress percentage
     */

    set(value) {
        const clampedValue = Math.min(Math.max(value, 0), 100);
        this.element.style.setProperty('--progress', clampedValue);
    }

    /**
     * Get current progress value (0-100)
     * @returns {number} - Current progress percentage
     */

    get() {
        return parseFloat(this.element.style.getPropertyValue('--progress')) || 0;
    }

}
