import { Component } from '/src/utils/component.js';

export class Copy extends Component {

    /**
     * Copy icon for copying text to clipboard
     * @param {string} args.text - text to copy
     */

    constructor(args) {
        super({...args, type: 'img'});

        this.element.classList.add('copy');
        this.element.src = 'assets/material-design-icons/content-copy.svg';
        this.element.title = 'Copy to clipboard';
        this.element.addEventListener('click', () => {
            navigator.clipboard.writeText(args.text);
            this.element.src = 'assets/material-design-icons/check-bold.svg';
            setTimeout(() => { this.element.src = 'assets/material-design-icons/content-copy.svg'; }, 2000);
        });
    }

}
