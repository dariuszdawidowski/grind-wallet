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

        // State open/close
        this.open = false;

        // Children components (to call 'destructor' on clear)
        this.children = [];

        // Element
        this.element.id = id;
        this.element.classList.add('sheet');

        // Prev chevron
        this.prevButton = document.createElement('img');
        this.prevButton.classList.add('prev');
        this.prevButton.src = 'assets/material-design-icons/chevron-left-black.svg';
        this.prevButton.style.display = 'none';
        this.prevButton.addEventListener('click', this.prev.bind(this));
        this.element.append(this.prevButton);

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

        // Pages prev/next
        this.pages = document.createElement('div');
        this.pages.classList.add('pages');
        this.element.append(this.pages);

        // Hide
        if (hidden) this.hide();
    }

    /**
     * Append content and show sheet
     * title: string - title of the sheet
     * component: Component - component to attach
     */

    append({ title, component } = {}) {

        // Hide previous pages
        const prevPages = this.pages.querySelectorAll('.page');
        prevPages.forEach(child => {
            child.style.display = 'none';
        });

        // Append page
        const page = document.createElement('div');
        page.classList.add('page');
        this.pages.append(page);

        // Title
        const titleElement = document.createElement('h1');
        titleElement.classList.add('title');
        titleElement.innerHTML = title;
        page.append(titleElement);

        // Content
        const content = document.createElement('div');
        content.classList.add('content');
        page.append(content);

        // Component
        this.children.push(component);
        content.append(component.element);

        // Show prev button if more than 1 page
        if (prevPages.length > 1) this.prevButton.style.display = 'block';
        else this.prevButton.style.display = 'none';

        // Show sheet
        this.show();
    }

    /**
     * Go to previous page
     */

    prev() {
        const pages = this.pages.querySelectorAll('.page');
        if (pages.length > 1) {
            pages[pages.length - 1].remove();
            pages[pages.length - 2].style.display = 'block';
        }
        if (pages.length <= 2) {
            this.prevButton.style.display = 'none';
        }
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

        // Clear pages
        this.pages.innerHTML = '';
    }

    /**
     * Show sheet
     */

    show() {
        if (!this.open) {
            // Change state
            this.open = true;
            // Show animation
            this.element.style.display = 'flex';
            setTimeout(() => {
                this.element.classList.add('visible');
            }, 10);
        }
    }

    /**
     * Hide sheet
     */

    hide() {
        if (this.open) {
            // Change state
            this.open = false;
            // Hide animation
            this.element.classList.remove('visible');
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Is open?
     */

    isOpen() {
        return this.open;
    }

}
