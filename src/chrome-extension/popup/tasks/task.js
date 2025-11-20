/**
 * Base class for a task (both ui sheet and task logic)
 */

import { Component } from '/src/utils/component.js';

export class Task extends Component {

    /**
     * Single task representation
     * 
     * @param {string} description - The task description text
     * @param {number} duration - The estimated duration in minutes
     */

    constructor({ app, description, started = null, duration = 0, step = 'begin' }) {
        super({ app });

        // Task properties
        this.task = {
            // UUID4 identifier
            id: null,
            // Named step
            step,
            // List of steps
            steps: [],
            // Creation timestamp
            created: Date.now(),
            // Estimated duration in minutes (1.0 = 1 minute)
            duration,
            // Task description
            description
        };

        // Timer
        this.timer = {
            // Timestamp when started
            started,
            // Total duration in milliseconds
            duration: duration * 60 * 1000,
            // Start the timer
            start: () => {
                this.timer.started = Date.now();
            },
            // Get elapsed time in milliseconds
            elapsed: () => {
                if (this.timer.started === null) return 0;
                return Date.now() - this.timer.started;
            },
            elapsedMinutes: () => {
                return Math.floor(this.timer.elapsed() / 60000);
            },
            // Get remaining time in milliseconds
            remaining: () => {
                if (this.timer.started === null) return this.timer.duration;
                return Math.max(0, this.timer.duration - this.timer.elapsed());
            },
            remainingMinutes: () => {
                return Math.ceil(this.timer.remaining() / 60000);
            },
            // Pause the timer
            pause: () => {
                if (this.timer.started === null) return;
                const elapsed = this.timer.elapsed();
                this.timer.duration -= elapsed;
                this.timer.started = null;
            },
            // Reset the timer
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
            description: this.task.description,
            started: this.timer.started,
            duration: this.timer.duration
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
        let line = this.task.description;
        line += '<span>';
        if (this.timer.started) {
            if (this.timer.remaining() > 0) {
                line += `~${this.timer.remainingMinutes()}m`;
            }
            else {
                line += `ready`;
            }
        }
        else {
            line += 'run to start';
        }
        // Show step progress with filled and empty dots
        const currentStep = this.task.steps.indexOf(this.task.step) + 1;
        line += ' ';
        for (let i = 1; i <= this.task.steps.length; i++) {
            line += i <= currentStep ? '&#9679;' : '&#9675;';
        }
        line += '</span>';
        taskItem.innerHTML = line;
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