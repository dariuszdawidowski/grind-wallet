/**
 * Transaction history details
 */

import { browser } from '/src/utils/browser.js';
import { Component } from '/src/utils/component.js';
import { shortAddress } from '/src/utils/general.js';
import { SummaryBox } from '/src/extension/popup/widgets/summary.js';
import { ButtLink } from '/src/extension/popup/widgets/button.js';
import { icpt2ICP } from '/src/utils/currency.js';

export class SheetHistoryDetails extends Component {

    constructor({ app, transaction }) {
        super({ app });
        
        console.log('Transaction details:', transaction);

        // Element
        this.element.classList.add('history-details');

        // Date and time
        const dateObj = new Date(transaction.datetime);
        const humanDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const humanTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Summary box
        this.summary = new SummaryBox();
        this.summary.element.style.width = 'calc(100% - 32px)';
        this.summary.row('Date', humanDate);
        this.summary.row('Time', humanTime);
        this.summary.row('Amount', `${transaction.type.startsWith('recv') ? '+' : '-'}${icpt2ICP(transaction.token.amount)} ICP`);
        this.summary.row('Fee', `${icpt2ICP(transaction.token.fee)} ICP`);
        if (transaction.type.startsWith('recv')) this.summary.row('From', this.renderAddressLink(transaction.from.account));
        else if (transaction.type.startsWith('send')) this.summary.row('To', this.renderAddressLink(transaction.to.account));
        this.append(this.summary);

        // Show in dashboard link
        if ('id' in transaction) {
            const transactionLink = new ButtLink({
                text: 'Show in Internet Computer Dashboard',
                click: () => {
                    browser.tabs.create({ url: `https://dashboard.internetcomputer.org/transaction/${transaction.id}` });
                }
            });
            transactionLink.element.style.marginTop = '20px';
            this.append(transactionLink);
        }

    }

    /**
     * Render address with link
     */

    renderAddressLink(address) {
        let buffer = '<a href="https://dashboard.internetcomputer.org/account/' + address + '" target="_blank" style="color: #fff; text-decoration:none;">';
        buffer += shortAddress(address);
        buffer += '<img src="assets/material-design-icons/open-in-new-white.svg" style="width:12px; height:12px; vertical-align:middle; margin-left:4px;"></img>';
        buffer += '</a>';
        return buffer;
    }

}