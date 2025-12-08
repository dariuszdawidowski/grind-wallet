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
        
        if (rowElement) {
            // Clear existing content
            rowElement.innerHTML = `<b>${title}</b>: `;
            
            // Append content
            if (content instanceof HTMLElement) {
                rowElement.appendChild(content);
            }
            else {
                rowElement.innerHTML += content;
            }
        }
        else {
            // Create new row
            const newRow = document.createElement('div');
            newRow.setAttribute('data-title', title);
            newRow.classList.add('summary-row');
            newRow.innerHTML = `<b>${title}</b>: `;
            
            // Append content
            if (content instanceof HTMLElement) {
                newRow.appendChild(content);
            }
            else {
                newRow.innerHTML += content;
            }
            
            this.element.appendChild(newRow);
        }
    }

}
