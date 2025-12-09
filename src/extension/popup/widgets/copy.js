import { Component } from '/src/utils/component.js';

export class Copy extends Component {

    /**
     * Copy icon for copying content to clipboard
     * @param {string} args.text - optional text to display
     * @param {string} args.buffer - text to copy
     */

    constructor(args) {
        super(args);

        this.element.classList.add('copy');
        this.element.title = 'Copy to clipboard';

        // Optional text display
        if ('text' in args) {
            const text = document.createElement('span');
            text.innerText = args.text;
            this.element.append(text);
        }

        // Icon
        const image = document.createElement('img');
        image.src = 'assets/material-design-icons/content-copy.svg';
        this.element.append(image);

        // Click to copy
        this.element.addEventListener('click', () => {
            navigator.clipboard.writeText(args.buffer);
            image.src = 'assets/material-design-icons/check-bold.svg';
            setTimeout(() => { image.src = 'assets/material-design-icons/content-copy.svg'; }, 2000);
        });
        
    }

}
