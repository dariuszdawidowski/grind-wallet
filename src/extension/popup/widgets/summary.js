/**
 * Transaction summary box
 */

import { Component } from '/src/utils/component.js';

export class SummaryBox extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('summary-box');
    }

    /**
     * Add or update row value
     * @param {string} title - Row title
     * @param {string|HTMLElement} content - Content as HTML string or DOM element
     */

    row(title, content) {
        const rowElement = this.element.querySelector(`[data-title="${title}"]`);
        
        // Create new
        if (!rowElement) {
            const newRow = document.createElement('div');
            newRow.setAttribute('data-title', title);
            newRow.classList.add('summary-row');

            // Title
            const titleElement = document.createElement('span');
            titleElement.classList.add('summary-row-title');
            titleElement.innerText = `${title}:`;
            newRow.append(titleElement);
            
            // Append content
            const contentElement = document.createElement('span');
            contentElement.classList.add('summary-row-content');
            newRow.append(contentElement);
            // if (content instanceof HTMLElement) {
                contentElement.append(content);
            // }
            // else {
            //     contentElement.innerHTML = content;
            // }
            
            this.element.append(newRow);
        }

        // Update existing content
        else {
            const titleElement = rowElement.querySelector('.summary-row-title');
            titleElement.innerText = `${title}:`;
            
            // Append content
            const contentElement = rowElement.querySelector('.summary-row-content');
            contentElement.replaceChildren();
            // if (content instanceof HTMLElement) {
                contentElement.append(content);
            // }
            // else {
            //     contentElement.innerHTML = content;
            // }
        }

    }

}
