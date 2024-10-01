import './popup.css';
import { App } from './Boost.js';
import { BottomSheet } from './widgets/BottomSheet.js';
import { PageNew } from './pages/account/New.js';
import { PageListAccounts } from './pages/account/List.js';

/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {
        this.card = new BottomSheet({selector: '#bottom-sheet', hidden: true});
        // this.page = new PageNew(this);
        this.page = new PageListAccounts(this);
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
