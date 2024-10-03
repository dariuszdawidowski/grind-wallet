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
 * salt: generated salt for password
 * password: hash of the main password to this extension
 */


/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {
        // Bottom Sheet
        this.sheet = new BottomSheet({selector: '#bottom-sheet', hidden: true});

        // Check that password exists
        chrome.storage.local.get(['salt', 'password'], (data) => {

            // Show accounts
            if (data.salt && data.password) {
                const page1 = new EnterPassword({app: this, salt: data.salt, hash: data.password});
                this.append(page1);
            }

            // First time - create password
            else {
                const page2 = new NewPassword({app: this});
                this.append(page2);
            }
        });

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
