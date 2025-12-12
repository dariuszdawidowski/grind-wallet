/**
 * Page: Settings page
 */

import { Component } from '/src/utils/component.js';
import { BurgerMenu } from '/src/extension/popup/menus/burger-menu.js';

export class PageSettings extends Component {

    constructor(args) {
        super(args);

        // Check valid session at each return to extension
        this.boundCheckSession = this.app.checkSession.bind(this.app);
        document.addEventListener('visibilitychange', this.boundCheckSession);

        // Header
        const header = document.createElement('h1');
        header.classList.add('product-title');
        const img = document.createElement('img');
        img.classList.add('product-logo');
        img.src = 'assets/icon16.png';
        header.append(img);
        const title = document.createElement('span');
        title.textContent = 'Grind Wallet ';
        const version = document.createElement('span');
        version.textContent = `v${this.app.version}`;
        version.style.fontSize = '12px';
        title.append(version);
        header.append(title);
        this.element.append(header);
        
        // Burger menu icon
        const burger = document.createElement('img');
        burger.src = 'assets/material-design-icons/menu.svg';
        burger.classList.add('burger');
        burger.addEventListener('click', () => {
            if (!this.app.drawer.isOpen()) {
                this.app.drawer.clear();
                this.app.drawer.append(this.burgerMenu);
                if (!this.burgerMenu.isRendered()) this.burgerMenu.render();
                this.app.drawer.open();
            }
            else {
                this.app.drawer.close();
            }
        });
        header.append(burger);

        // Burger menu
        this.burgerMenu = new BurgerMenu({ app: this.app });

        // Title
        const header1 = document.createElement('h4');
        header1.textContent = 'Settings Page';
        this.element.append(header1);
        const header1sub = document.createElement('h5');
        header1sub.textContent = 'Welcome to the Settings Page!';
        this.element.append(header1sub);

    }

    /**
     * Destructor
     */

    destructor() {
        document.removeEventListener('visibilitychange', this.boundCheckSession);
    }

}