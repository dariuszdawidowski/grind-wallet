/**
 * Task Manager
 */

import { Component } from '/src/utils/component.js';

export class TaskManager extends Component {

    constructor({ app }) {
        super({ app });

        // Style
        this.element.classList.add('tasks');

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
