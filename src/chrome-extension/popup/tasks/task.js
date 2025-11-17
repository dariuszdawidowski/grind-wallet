/**
 * Base class for a task
 */

import { Component } from '/src/utils/component.js';

export class Task extends Component {

    /**
     * Single task representation
     * 
     * @param {string} description - The task description text
     * @param {number} duration - The estimated duration in minutes
     */

    constructor({ app, description, duration }) {
        super({ app });
        this.task = {
            step: 1,
            created: Date.now(),
            duration: duration,
            durationMs: duration * 60 * 1000,
            description: description
        };
    }

    /**
     * Serialize task data
     */

    serialize() {
        return {
            class: 'Task',
            step: this.task.step,
            created: this.task.created,
            duration: this.task.duration,
            description: this.task.description,
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new Task(data);
    }

    /**
     * Generate HTML entry
     */

    html() {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `${this.task.description}<span>${this.task.duration === -1 ? 'enter to start &#9679;&#9675;&#9675;' : `~${this.task.duration}m`}</span>`;
        return taskItem;
    }

}