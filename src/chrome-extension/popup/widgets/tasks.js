/**
 * Task Manager
 */

import { Component } from '/src/utils/component.js';
import { Progress } from '/src/chrome-extension/popup/widgets/progress.js';
import { Task } from '/src/chrome-extension/popup/tasks/task.js';
import { TaskMintCK } from '/src/chrome-extension/popup/tasks/task-mint-ck.js';

export class TaskManager extends Component {

    constructor({ app }) {
        super({ app });

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
        openTasks.innerHTML = 'Click to open the task<img src="assets/material-design-icons/chevron-right-black.svg" width="20" height="20" style="margin-bottom: -6px;">';
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

        // Update every 1 minute
        setInterval(() => this.update(), 60000);
    }

    /**
     * Load config and initialize
     */

    async init() {
        await this.load();
        this.update();
        this.element.addEventListener('click', this.openTaskSheet.bind(this));
    }

    /**
     * Load config from storage
     */

    async load() {
        // Class registry for deserialization
        const classRegistry = {
            Task: Task,
            TaskMintCK: TaskMintCK
        };

        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get(['tasks'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    }
                    else {
                        const tasksData = result.tasks || {};
                        for (const [id, data] of Object.entries(tasksData)) {
                            const TaskClass = classRegistry[data.class] || Task;
                            const task = TaskClass.deserialize({ app: this.app, ...data });
                            task.task.id = id;
                            this.tasks[id] = task;
                            this.list.append(task.html());
                        }
                        resolve(true);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Save config to storage
     */

    async save() {
        // Prepare serializable tasks
        const payload = {};
        for (const [id, task] of Object.entries(this.tasks)) {
            let data = task.serialize();
            payload[id] = data;
        }

        // Save to chrome extension local storage
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.set({ tasks: payload }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    }
                    else {
                        resolve(true);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Add a task
     */

    add(task) {
        const id = crypto.randomUUID();
        task.task.id = id;
        this.tasks[id] = task;
        this.list.append(task.html());
        this.save();
    }

    /**
     * Remove a task
     */

    async del(id) {
        const taskElement = this.list.querySelector(`#task-${id}`);
        taskElement.remove();
        delete this.tasks[id];
        await this.save();
        this.update();
    }

    /**
     * Update render
     */

    update() {
        // Update tasks list
        for (const [id, task] of Object.entries(this.tasks)) {
            const taskElement = this.list.querySelector(`#task-${id}`);
            const newTaskElement = task.html();
            this.list.replaceChild(newTaskElement, taskElement);
        }
        // Show/hide widget
        const taskSeparator = document.getElementById('task-separator');
        if (Object.keys(this.tasks).length === 0) {
            this.element.style.display = 'none';
            if (taskSeparator) taskSeparator.style.display = 'none';
            return false;
        }
        else {
            this.element.style.display = 'flex';
            if (taskSeparator) taskSeparator.style.display = 'block';
            return true;
        }

    }

    /**
     * Open task sheet
     */

    openTaskSheet() {
        if (!this.app.sheet.isOpen()) {
            // Clicked task TODO - support multiple tasks
            const clickedTask = this.tasks[Object.keys(this.tasks)[0]];
            this.app.sheet.append({
                title: clickedTask.task.description,
                component: clickedTask,
            });
        }
    }

}
