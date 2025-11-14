/**
 * Base class for a task
 */

export class Task {

    /**
     * Single task representation
     * 
     * @param {string} description - The task description text
     * @param {number} duration - The estimated duration in minutes
     */

    constructor({ description, duration }) {
        this.created = Date.now();
        this.duration = duration;
        this.durationMs = duration * 60 * 1000;
        this.description = description;
    }

    /**
     * Serialize task data
     */

    serialize() {
        return {
            class: 'Task',
            description: this.description,
            created: this.created,
            duration: this.duration
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
        taskItem.innerHTML = `${this.description}<span>${this.duration === -1 ? 'enter to start &#9679;&#9675;&#9675;' : `~${this.duration}m`}</span>`;
        return taskItem;
    }

}