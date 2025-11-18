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

    constructor({ app, description, duration, step = 'begin' }) {
        super({ app });
        this.task = {
            id: null,
            step,
            created: Date.now(),
            duration,
            durationMs: duration * 60 * 1000,
            description
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
        taskItem.id = `task-${this.task.id}`;
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `${this.task.description}<span>${this.task.duration === -1 ? 'enter to start &#9679;&#9675;&#9675;' : `~${this.task.duration}m`}</span>`;
        return taskItem;
    }

    /**
     * Self-save task
     */

    async save() {
        await this.app.tasks.save();
    }

    /**
     * Self-delete task
     */

    del() {
        this.app.tasks.del(this.task.id);
    }

}