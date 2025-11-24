/**
 * Grind sheet card
 * args:
 *   id: unique identifier
 *   hidden: hide at start
 */

import { Component } from '/src/utils/component.js';

export class Sheet extends Component {

    constructor({ app, id, hidden = true }) {
        super({ app });

        this.element.id = id;
        this.element.classList.add('sheet', 'hide-scrollbar');
         this.element.innerHTML = `
            <div class="handler"></div>
            <div class="x">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </div>
            <h1 class="title"></h1>
            <div class="content"></div>
        `;

        // State open/close
        this.open = false;

        // X close button
        this.x = this.element.querySelector('.x');
        this.x.addEventListener('click', () => {
            this.clear();
            this.hide();
        });

        // Title
        this.title = this.element.querySelector('h1.title');

        // Children components
        this.children = [];

        // Content
        this.content = this.element.querySelector('.content');

        // Hide
        if (hidden) this.hide();
    }

    /**
     * Append content and show sheet
     * args (different than regular component):
     *   title: string - title of the sheet
     *   component: Component - component to attach
     */

    append(args) {

        // Change state
        this.open = true;

        // Title
        this.title.innerHTML = args.title;

        // Append
        this.children.push(args.component);
        this.content.append(args.component.element);

        // Show animation
        this.element.style.display = 'flex';
        setTimeout(() => {
            this.element.classList.add('visible');
        }, 10);
    }

    /**
     * Update content
     */

    update({ title } = {}) {
        // Title
        if (title) this.title.innerText = title;
    }

    /**
     * Clear content
     */

    clear() {
        // Destroy child components
        this.children.forEach(child => child.destructor?.());
        this.children = [];

        // Clear DOM
        this.content.innerHTML = '';
    }

    /**
     * Hide sheet
     */

    hide() {
        // Hide animation
        this.element.classList.remove('visible');
        setTimeout(() => {
            this.element.style.display = 'none';
            // Change state
            this.open = false;
        }, 500);
    }

    /**
     * Is open?
     */

    isOpen() {
        return this.open;
    }

}
