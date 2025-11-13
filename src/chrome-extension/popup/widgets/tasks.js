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

        // Left
        const left = document.createElement('div');
        left.style.width = '80%';
        this.element.append(left);

        // Title
        const title = document.createElement('h2');
        title.style.marginLeft = '24px';
        title.style.textAlign = 'left';
        title.style.fontWeight = '500';
        title.textContent = 'Task Manager';
        left.append(title);

        // Task list
        this.list = document.createElement('div');
        this.list.classList.add('task-list');
        left.append(this.list);

        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = 'Minting 12 BTC &rarr; ckBTC<span>~2m</span>';
        this.list.append(taskItem);

        const taskItem2 = document.createElement('div');
        taskItem2.classList.add('task-item');
        taskItem2.innerHTML = 'Minting 0.01 BTC &rarr; ckBTC<span>~20m</span>';
        this.list.append(taskItem2);

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

}
