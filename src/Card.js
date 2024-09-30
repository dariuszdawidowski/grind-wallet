/**
 * Grind Card
 * args:
 *   selector: query
 *   hidded: hide at start
 */

export class GrindCard {

    constructor(args) {

        const {selector = '', hidden = true} = args;

        // Main container
        this.element = document.querySelector(selector);

        // X close button
        this.x = this.element.querySelector('.x');
        this.x.addEventListener('click', () => this.hide());

        // Title
        this.title = this.element.querySelector('h1.title');

        // Content
        this.content = this.element.querySelector('.content');

        // Hide
        if (hidden) this.hide();
    }

    /**
     * Show card
     */

    show(args) {

        const { title = null, content = null } = args;

        if (title) this.title.innerText = title;
        if (content) {
            if (typeof(content) == 'string')
                this.content.innerHTML = content;
            else if (typeof(content) == 'object')
                this.content.append(content);
        }

        this.element.style.display = 'block';
        setTimeout(() => {
            this.element.classList.add('visible');
        }, 10);
    }

    /**
     * Hide card
     */

    hide() {
        this.element.classList.remove('visible');
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 500);
    }
}
