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
        this.renderList({
            id: 'view',
            name: 'View',
            entries: {
                'view-side': { name: 'Side View' },
                'view-full': { name: 'Full Screen' }
            },
            onSelectEntry: (entryId) => {
                if (entryId == 'view-side') this.dockSidePanel();
                console.log('Selected view mode:', entryId);
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
