/**
 * Main burger menu for accounts page
 */

import { ListView } from '/src/extension/popup/widgets/list.js';

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
                'view-side': { id: 'view-side', name: 'Side View', address: { 'icp:pid': 'ysuep' }, dynamic: false },
                'view-full': { id: 'view-full', name: 'Full Screen', address: { 'icp:pid': 'ysuep' }, dynamic: false }
            }
        });
    }
}
