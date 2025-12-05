/**
 * Tab bar widget
 */

import { Component } from '/src/utils/component.js';

export class TabBar extends Component {

    /**
     * Constructor
     * @param {object} args.app - application instance
     */

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('tab-bar');

        // Icons
        this.home = new TabBarIcon({
            icon: 'assets/material-design-icons/home.svg',
            title: 'Home'
        });
        this.append(this.home);
        this.accounts = new TabBarIcon({
            icon: 'assets/material-design-icons/wallet-black.svg'
        });
        this.append(this.accounts);
        this.settings = new TabBarIcon({
            icon: 'assets/material-design-icons/cog.svg',
            title: 'Settings'
        });
        this.append(this.settings);

    }

}

export class TabBarIcon extends Component {

    /**
     * Constructor
     * @param {object} args.icon - icon path
     * @param {string} [args.title] - title text
     */

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('tab-bar-icon');

        // Icon
        this.iconElement = document.createElement('img');
        this.iconElement.src = args.icon;
        this.element.appendChild(this.iconElement);

        // Title
        if (args.title) {
            this.titleElement = document.createElement('span');
            this.titleElement.textContent = args.title;
            this.element.appendChild(this.titleElement);
            this.iconElement.classList.add('with-title');
        }

    }

}
