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

        // Element
        this.element.id = id;
        this.element.classList.add('sheet');

        // State open/close
        this.open = false;

        // Handler
        this.handler = document.createElement('div');
        this.handler.classList.add('handler');
        this.element.append(this.handler);

        // X close button
        this.x = document.createElement('div');
        this.x.classList.add('x');
        this.x.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        `;
        this.element.append(this.x);
        this.x.addEventListener('click', () => {
            this.clear();
            this.hide();
        });

        // Title
        this.title = document.createElement('h1');
        this.title.classList.add('title');
        this.element.append(this.title);

        // Children components (to call 'destructor' on clear)
        this.children = [];

        // Content
        this.content = document.createElement('div');
        this.content.classList.add('content');
        this.element.append(this.content);

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

        // Title
        this.title.innerHTML = args.title;

        // Append
        this.children.push(args.component);
        this.content.append(args.component.element);

        this.show();
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
     * Show sheet
     */

    show() {
        // Change state
        this.open = true;

        // Show animation
        this.element.style.display = 'flex';
        setTimeout(() => {
            this.element.classList.add('visible');
        }, 10);
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
