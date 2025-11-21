/**
 * Drawer widget - sliding menu from the side
 */

export class Drawer {

    constructor() {
        // Children components
        this.children = [];

        // Query panels
        this.mainPanel = document.getElementById('main-panel');
        this.drawerPanel = document.getElementById(`drawer-panel`);
    }

    open() {
        this.mainPanel.classList.add('drawer-open');
        this.drawerPanel.classList.add('drawer-open');
    }

    close() {
        this.mainPanel.classList.remove('drawer-open');
        this.drawerPanel.classList.remove('drawer-open');
    }

    toggle() {
        this.mainPanel.classList.toggle('drawer-open');
        this.drawerPanel.classList.toggle('drawer-open');
    }

    isOpen() {
        return this.mainPanel.classList.contains('drawer-open');
    }

    /**
     * Append content to the drawer
     */

    append(component) {
        // Append Component
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
