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

        // Task properties
        this.task = {
            id: null,
            step,
            created: Date.now(),
            duration,
            description
        };

        // Timer
        this.timer = {
            started: null,
            duration: duration * 60 * 1000,
            start: () => {
                this.timer.started = Date.now();
            },
            elapsed: () => {
                if (this.timer.started === null) return 0;
                return Date.now() - this.timer.started;
            },
            remaining: () => {
                if (this.timer.started === null) return this.timer.duration;
                return Math.max(0, this.timer.duration - this.timer.elapsed());
            },
            pause: () => {
                if (this.timer.started === null) return;
                const elapsed = this.timer.elapsed();
                this.timer.duration -= elapsed;
                this.timer.started = null;
            },
            reset: () => {
                this.timer.started = null;
                this.timer.duration = duration * 60 * 1000;
            }
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