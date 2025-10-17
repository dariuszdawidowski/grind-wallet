/**
 * Grind Card
 * args:
 *   selector: query
 *   hidded: hide at start
 */

import { Component } from '/src/utils/Component.js';


export class Sheet extends Component {

    constructor(args) {
        super(args);

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
        if (('hidden' in args) && args.hidden) this.hide();
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
        this.title.innerText = args.title;

        // Append
        this.children.push(args.component);
        this.content.append(args.component.element);

        // Show animation
        this.element.style.display = 'block';
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
