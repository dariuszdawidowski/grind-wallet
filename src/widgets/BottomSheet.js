/**
 * Grind Card
 * args:
 *   selector: query
 *   hidded: hide at start
 */

import { Component } from '../Boost.js';


export class BottomSheet extends Component {

    constructor(args) {
        super(args);

        // X close button
        this.x = this.element.querySelector('.x');
        this.x.addEventListener('click', () => {
            this.clear();
            this.hide();
        });

        // Title
        this.title = this.element.querySelector('h1.title');

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

        // Title
        this.title.innerText = args.title;

        // Append to childred list
        this.children.push(args.component);

        // Append
        this.content.append(args.component.element);

        // Show animation
        this.element.style.display = 'block';
        setTimeout(() => {
            this.element.classList.add('visible');
        }, 10);
    }

    /**
     * Clear content
     */

    clear() {

        // Destroy child components
        this.children.forEach(child => {
            child.destructor();
        });
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
        }, 500);
    }
}
