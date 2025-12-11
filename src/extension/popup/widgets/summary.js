/**
 * Transaction summary box
 */

import { Component } from '/src/utils/component.js';

export class SummaryBox extends Component {

    constructor({ app = null, text = null } = {}) {
        super({ app });

        // Build
        this.element.classList.add('summary-box');
        if (text) this.element.innerHTML = text;

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
            newRow.appendChild(titleElement);
            
            // Append content
            const contentElement = document.createElement('span');
            contentElement.classList.add('summary-row-content');
            newRow.appendChild(contentElement);
            if (content instanceof HTMLElement) {
                contentElement.appendChild(content);
            }
            else {
                contentElement.innerHTML = content;
            }
            
            this.element.appendChild(newRow);
        }

        // Update existing content
        else {
            const titleElement = rowElement.querySelector('.summary-row-title');
            titleElement.innerText = `${title}:`;
            
            // Append content
            const contentElement = rowElement.querySelector('.summary-row-content');
            contentElement.innerHTML = '';
            if (content instanceof HTMLElement) {
                contentElement.appendChild(content);
            }
            else {
                contentElement.innerHTML = content;
            }
        }

    }

}
