import './popup.css';
import { App } from './Boost.js';
import { BottomSheet } from './widgets/BottomSheet.js';
import { PageEmpty } from './pages/account/Empty.js';
import { PageListAccounts } from './pages/account/List.js';
import { NewPassword } from './pages/user/NewPassword.js';

/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {
        this.card = new BottomSheet({selector: '#bottom-sheet', hidden: true});
        this.page = new PageEmpty({app: this});
        // this.page = new PageListAccounts({app: this});
        // this.page = new NewPassword({app: this});
        this.append(this.page);
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
