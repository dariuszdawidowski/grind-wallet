// import { Principal } from '@dfinity/principal';
// import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Component } from '/src/utils/Component.js';
// import { formatCurrency, icpt2ICP } from '/src/utils/Currency.js';
// import { Button, ButtonDescription } from '/src/widgets/button.js';
// import { InputCurrency, InputAddress } from '/src/widgets/input.js';
//import { icpLedgerTransfer, icpLedgerFee } from '/src/blockchain/InternetComputer/Ledger.js';

export class SheetTransactionHistory extends Component {

    constructor(args) {
        super(args);

        this.element.classList.add('history');

        this.app = args.app;
        this.wallet = args.wallet;

        this.lastDate = null;

        this.app.log.get({ pid: this.wallet.principal }).then(logs => {
            const sortedLogs = Object.entries(logs).sort((a, b) => new Date(b[0]) - new Date(a[0]));
            console.log(sortedLogs)
            if (Object.keys(sortedLogs).length > 0) {
                for (const [datetime, entry] of sortedLogs) {
                    this.renderRow(datetime, entry);
                }
            }
            else {
                const info = document.createElement('h2');
                info.textContent = '- Seems there is no history for this wallet -';
                this.element.append(info);
            }
        });
    }

    /**
     * Render human readable and locale date header
     */

    renderDate(isodate) {
        const dateObj = new Date(isodate);
        const humanDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const header = document.createElement('h2');
        header.textContent = humanDate;
        this.element.append(header);
    }

    /**
     * Render one entry
     */

    renderRow(datetime, entry) {
        const date = datetime.slice(0, 10);
        if (date != this.lastDate) {
            this.renderDate(datetime);
            this.lastDate = date;
        }
        console.log(entry);

        // Entry
        const row = document.createElement('div');
        row.classList.add('entry');
        this.element.append(row);

        // Icon circle container
        const icon = document.createElement('div');
        icon.classList.add('circle');
        row.append(icon);

        // Icon image
        const image = document.createElement('img');
        image.src = 'assets/material-design-icons/plus.svg';
        icon.append(image);

    }


}

