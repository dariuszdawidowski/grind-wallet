/**
 * Main burger menu for accounts page
 */

import { browser } from '/src/utils/browser.js';
import { ListView } from '/src/extension/popup/widgets/list.js';

export class BurgerMenu extends ListView {

    /**
     * Render main burger menu
     */

    render() {

        // View
        this.renderList({
            name: 'View',
            entries: {
                'view-side': { name: 'Dock in Side Panel', order: 1, icon: 'assets/material-design-icons/dock-right.svg' },
                'view-hide-balance': { name: 'Hide Balance', order: 2, switcher: (this.app.config.hideBalances) ? 'on' : 'off' },
            },
            onClickEntry: (info) => {
                // Dock side panel
                if (info.id == 'view-side') {
                    this.dockSidePanel();
                }
                // Hide balance
                else if (info.id == 'view-hide-balance') {
                    if (info.switcher == 'on') this.app.hideBalances();
                    else if (info.switcher == 'off') this.app.showBalances();
                    this.app.config.hideBalances = (info.switcher == 'on');
                    this.app.config.save();
                }
            },
        });

        // Config
        this.renderList({
            name: 'Configuration',
            entries: {
                'cfg-show-scrolls': { name: 'Show scroll bars', order: 1, switcher: (this.app.config.showScrolls) ? 'on' : 'off' },
                'cfg-session-time': { name: 'Session timeout', order: 2, input: { value: this.app.config.sessionTimeout, unit: 'min' } },
                'cfg-send-errors': { name: 'Send errors to developer', order: 3, switcher: (this.app.config.sendErrors) ? 'on' : 'off' },
            },
            onClickEntry: (info) => {
                // Show scrolls
                if (info.id == 'cfg-show-scrolls') {
                    this.app.config.showScrolls = (info.switcher == 'on');
                    this.app.config.save();
                    if (this.app.config.showScrolls) this.app.showScrollbars();
                    else this.app.hideScrollbars();
                }
                // Session time
                else if (info.id == 'cfg-session-time') {
                    const newTime = parseInt(info.input);
                    if (!isNaN(newTime) && newTime >= 1 && newTime <= 1440) {
                        this.app.config.sessionTimeout = newTime;
                        this.app.config.save();
                    }
                }
                // Send errors
                else if (info.id == 'cfg-send-errors') {
                    this.app.config.sendErrors = (info.switcher == 'on');
                    this.app.config.save();
                }
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
                // Show scrolls
                if (info.id == 'info-website') {
                    browser.tabs.create({ url: 'https://www.grindwallet.com' });
                }
                else if (info.id == 'info-dao') {
                    browser.tabs.create({ url: 'https://huptf-mqaaa-aaaao-qj4wa-cai.icp0.io' });
                }
            },
        });

        // Account
        this.renderList({
            name: 'Account',
            entries: {
                'acc-logout': { name: 'Logout', icon: 'assets/material-design-icons/power.svg' },
            },
            onClickEntry: (info) => {
                this.app.session.clear();
                window.location.reload();
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
