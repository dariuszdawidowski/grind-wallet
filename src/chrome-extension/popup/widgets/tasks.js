/**
 * Task Manager
 */

import { Component } from '/src/utils/component.js';
import { Progress } from '/src/chrome-extension/popup/widgets/progress.js';

export class TaskManager extends Component {

    constructor(args = {}) {
        super(args);

        // Style
        this.element.classList.add('tasks');

        // Progress meter
        this.progress = new Progress();
        this.append(this.progress);
        this.progress.set(75);

    }

    /**
     * Load config and initialize
     */

    async init() {
    }

    /**
     * Load config from storage
     */

    async load() {
    }

    /**
     * Save config to storage
     */

    async save() {
    }

}
