/**
 * Transaction history details
 */

import { Component } from '/src/utils/component.js';
import { transactionNames } from '/src/utils/dictionary.js';

export class SheetTransactionHistoryDetails extends Component {

    constructor({ app, transaction }) {
        super({ app });
        
        console.log('Transaction details:', transaction);

        // Element
        this.element.classList.add('history-details');
        this.element.innerHTML = `<h2>${transactionNames[transaction.type] || 'Transaction details'}</h2>`;
    }

}