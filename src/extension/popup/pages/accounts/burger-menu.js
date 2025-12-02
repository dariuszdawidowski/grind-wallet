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
                'view-side': { name: 'Dock in Side Panel', order: 1 },
            },
            onSelectEntry: (entryId) => {
                if (entryId == 'view-side') this.dockSidePanel();
            },

        });

        // Config
        this.renderList({
            name: 'Configuration',
            entries: {
                'cfg-show-scrolls': { name: 'Show scrolls', order: 1 },
                'cfg-session-time': { name: 'Session time', order: 2 },
                'cfg-send-errors': { name: 'Send errors to developer', order: 3 },
            },
            onSelectEntry: (entryId) => {
            },

        });

        // Information
        this.renderList({
            name: 'Information',
            entries: {
                'info-website': { name: 'Project website', order: 1 },
                'info-dao': { name: 'Grind DAO', order: 2 },
            },
            onSelectEntry: (entryId) => {
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
