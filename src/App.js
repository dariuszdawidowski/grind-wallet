import './popup.css';
import { App } from './Boost.js';
import { BottomSheet } from './widgets/BottomSheet.js';
import { PageNew } from './pages/account/New.js';


/**
 * Main class
 */

class GrindWalletPlugin extends App {

    init() {
        this.card = new BottomSheet({selector: '#bottom-sheet', hidden: true});
        this.pageNew = new PageNew(this);
        this.append(this.pageNew);
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
