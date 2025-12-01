/**
 * Drawer widget - sliding menu from the side
 */

export class Drawer {

    constructor() {
        // Children components
        this.children = [];

        // Query panels
        this.mainPanel = document.getElementById('main-panel');
        this.drawerPanel = document.getElementById('drawer-panel');

        // Click handler reference for cleanup
        this.clickHandler = (e) => {
            if (e.target.closest('#drawer-panel') === null) this.close();
        };
    }

    open() {
        this.mainPanel.classList.add('drawer-open');
        this.drawerPanel.classList.add('drawer-open');
        setTimeout(() => {
            this.mainPanel.addEventListener('click', this.clickHandler);
        }, 0);
    }

    close() {
        this.mainPanel.classList.remove('drawer-open');
        this.drawerPanel.classList.remove('drawer-open');
        this.mainPanel.removeEventListener('click', this.clickHandler);
    }

    toggle() {
        if (this.isOpen()) this.close();
        else this.open();
    }

    isOpen() {
        return this.mainPanel.classList.contains('drawer-open');
    }

    /**
     * Append content to the drawer
     */

    append(component) {
        this.children.push(component);
        this.drawerPanel.append(component.element);
    }

    /**
     * Clear content
     */

    clear() {
        // Destroy child components
        this.children.forEach(child => child.destructor?.());
        this.children = [];

        // Clear DOM
        this.drawerPanel.innerHTML = '';
    }

}
