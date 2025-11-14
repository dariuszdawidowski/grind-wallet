/**
 * Task Manager
 */

import { Component } from '/src/utils/component.js';
import { Progress } from '/src/chrome-extension/popup/widgets/progress.js';

export class TaskManager extends Component {

    constructor(args = {}) {
        super(args);

        // Tasks registry { id: Task, ... }
        this.tasks = {};

        // Style
        this.element.classList.add('tasks');

        // Left
        const left = document.createElement('div');
        left.classList.add('tasks-left');
        this.element.append(left);

        // Title
        const title = document.createElement('h2');
        title.classList.add('task-title');
        title.textContent = 'Task Manager';
        left.append(title);

        // Task list
        this.list = document.createElement('div');
        this.list.classList.add('task-list');
        left.append(this.list);

        // Open tasks
        const openTasks = document.createElement('div');
        openTasks.classList.add('task-link');
        openTasks.innerHTML = 'Click to open the task &gt;';
        left.append(openTasks);

        // Right
        const right = document.createElement('div');
        right.style.width = '20%';
        right.style.display = 'flex';
        right.style.alignItems = 'flex-end';
        right.style.justifyContent = 'center';
        this.element.append(right);

        // Progress meter
        this.progress = new Progress();
        right.append(this.progress.element);
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

    /**
     * Add a task
     */

    add(task) {
        const id = crypto.randomUUID();
        this.tasks[id] = task;
        this.list.append(task.html());
    }

    /**
     * Remove a task
     */

    del(id) {
        delete this.tasks[id];
    }

    /**
     * Update render
     */

    update() {
        const taskSeparator = document.getElementById('task-separator');
        if (Object.keys(this.tasks).length === 0) {
            this.element.style.display = 'none';
            if (taskSeparator)  taskSeparator.style.display = 'none';
            return false;
        }
        else {
            this.element.style.display = 'flex';
            if (taskSeparator) taskSeparator.style.display = 'block';
            return true;
        }

    }

}
