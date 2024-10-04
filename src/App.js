/**
 * Grind Wallet extension
 * (c) 2024 by Dariusz Dawidowski
 */

import './popup.css';
import { App } from './Boost.js';
import { BottomSheet } from './widgets/BottomSheet.js';
import { PageEmpty } from './pages/account/Empty.js';
import { PageListAccounts } from './pages/account/List.js';
import { NewPassword } from './pages/user/NewPassword.js';
import { EnterPassword } from './pages/user/EnterPassword.js';

/**
 * Persistent data map @ chrome.storage.local
 * 
 * version: 1 migration version
 * salt: <string> generated salt for password
 * password: <string> hash of the main password to this extension
 * accounts: [{name: string, principal: string, account: string, private: encrypted string}, ...]
 */


/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {

        // Bottom Sheet
        this.sheet = new BottomSheet({app: this, selector: '#bottom-sheet', hidden: true});

        // Active page
        this.current = null;

        // User credentials
        this.user = {
            password: null,
        };

        // Check data version
        chrome.storage.local.get(['version'], (data) => {
            if (data.version) {
                // Migrate in the future
            }
            else {
                chrome.storage.local.set({ version: 1 });
            }

            // Check session
            chrome.storage.session.get(['active', 'password'], (result) => {

                // Continue session
                if (result.active) {
                    this.user.password = result.password;
                    this.page('empty');
                }

                // No active session
                else {
                    // Check that password exists
                    chrome.storage.local.get(['salt', 'password'], (data) => {

                        // Login
                        if (data.salt && data.password) {
                            this.page('login', {salt: data.salt, hash: data.password});
                        }

                        // First time - create password
                        else {
                            this.page('register');
                        }
                    });
                }
            });

        });

    }

    /**
     * Clear and switch to a new page
     */

    page(name, args = {}) {

        // Clear events
        this.event.clear();

        // Remove DOM
        if (this.current) this.current.element.remove();

        // Destroy object
        this.current = null;

        // Create and attach new
        switch(name) {
            case 'register':
                this.current = new NewPassword({app: this});
                this.append(this.current);
                break;
            case 'login':
                this.current = new EnterPassword({app: this, ...args});
                this.append(this.current);
                break;
            case 'empty':
                this.current = new PageEmpty({app: this});
                this.append(this.current);
                break;
            case 'accounts':
                break;
        }

    }

}


/**
 * Global interface
 */

// window.grind = {
// };


/**
 * Start
 */

const app = new GrindWalletPlugin('#app');
