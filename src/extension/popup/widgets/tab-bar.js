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
            icon: {
                selected: 'assets/material-design-icons/home.svg',
                deselected: 'assets/material-design-icons/home-outline.svg'
            },
            title: 'Home',
            onClick: () => {
                this.home.select();
                this.accounts.deselect();
                this.settings.deselect();
                this.app.page('home');
            }
        });
        this.append(this.home);
        this.accounts = new TabBarIcon({
            icon: {
                selected: 'assets/material-design-icons/wallet-black.svg',
                deselected: 'assets/material-design-icons/wallet-outline-black.svg'
            },
            onClick: () => {
                this.home.deselect();
                this.accounts.select();
                this.settings.deselect();
                this.app.page('accounts');
            }
        });
        this.append(this.accounts);
        this.settings = new TabBarIcon({
            icon: {
                selected: 'assets/material-design-icons/cog.svg',
                deselected: 'assets/material-design-icons/cog-outline.svg'
            },
            title: 'Settings',
            onClick: () => {
                this.home.deselect();
                this.accounts.deselect();
                this.settings.select();
                this.app.page('settings');
            }
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

        // State
        this.selected = false;

        // Icon
        this.icon = args.icon;

        // Build
        this.element.classList.add('tab-bar-icon');

        // Icon
        this.iconElement = document.createElement('img');
        this.iconElement.src = args.icon.deselected;
        this.element.appendChild(this.iconElement);

        // Title
        if (args.title) {
            this.titleElement = document.createElement('span');
            this.titleElement.textContent = args.title;
            this.element.appendChild(this.titleElement);
            this.iconElement.classList.add('with-title');
        }

        // Events
        this.element.addEventListener('click', () => {
            if (args.onClick) {
                args.onClick();
            }
        });

    }

    /**
     * Set selected
     */

    select() {
        this.selected = true;
        this.element.classList.add('selected');
        this.iconElement.src = this.icon.selected;
    }

    /**
     * Set deselected
     */

    deselect() {
        this.selected = false;
        this.element.classList.remove('selected');
        this.iconElement.src = this.icon.deselected;
    }

}
