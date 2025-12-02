/**
 * Main burger menu for accounts page
 */

import { ListView } from '/src/extension/popup/widgets/list.js';
import { browser } from '/src/utils/browser.js';

export class BurgerMenu extends ListView {

    constructor(args) {
        super(args);
    }

    /**
     * Render main burger menu
     */

    render() {

        // View
        this.renderList({
            name: 'View',
            entries: {
                'view-side': { name: 'Dock in Side Panel', order: 1, icon: 'assets/material-design-icons/dock-right.svg' },
                'view-hide-balance': { name: 'Hide Balance', order: 2, switcher: 'off' },
            },
            onClickEntry: (info) => {
                if (info.id == 'view-side') this.dockSidePanel();
                else if (info.id == 'view-hide-balance') {
                    console.log('Hide balance')
                }
            },
        });

        // Config
        this.renderList({
            name: 'Configuration',
            entries: {
                'cfg-show-scrolls': { name: 'Show scrolls', order: 1, switcher: 'on' },
                'cfg-session-time': { name: 'Session time', order: 2, input: { value: 15, unit: 'min' } },
                'cfg-send-errors': { name: 'Send errors to developer', order: 3, switcher: 'off' },
            },
            onClickEntry: (info) => {
                console.log(info)
            },
        });

        // Information
        this.renderList({
            name: 'Information',
            entries: {
                'info-website': { name: 'Project website', order: 1, icon: 'assets/material-design-icons/open-in-new.svg' },
                'info-dao': { name: 'Grind DAO', order: 2, icon: 'assets/material-design-icons/open-in-new.svg' },
            },
            onClickEntry: (info) => {
                console.log(info)
            },
        });

        // Account
        this.renderList({
            name: 'Account',
            entries: {
                'acc-logout': { name: 'Logout', icon: 'assets/material-design-icons/power.svg' },
            },
            onClickEntry: (info) => {
                console.log(info)
            },
        });

    }

    /**
     * Dock extension in a side panel
     */

    async dockSidePanel() {
        try {
            // Check if we're in Firefox or Chrome
            const isFirefox = typeof browser !== 'undefined' && browser.runtime.getBrowserInfo !== undefined;
            
            if (isFirefox) {
                // Firefox: use sidebar API
                await browser.sidebarAction.open();
            }
            else {
                // Chrome: use sidePanel API
                const currentWindow = await browser.windows.getCurrent();
                await browser.sidePanel.open({ windowId: currentWindow.id });
            }
            
            // Close popup if opened from popup
            window.close();
        }
        catch (error) {
            console.error('Failed to open side panel:', error);
        }
    }
}
