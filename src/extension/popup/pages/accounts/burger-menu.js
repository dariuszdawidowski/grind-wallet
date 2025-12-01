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
                'view-side': { name: 'Side View' },
                'view-full': { name: 'Full Screen' }
            },
            onSelectEntry: (entryId) => {
                console.log('Selected view mode:', entryId);
            },

        });
    }
}
