import { Component } from '/src/utils/Component.js';
import { shortPrincipalId } from '/src/utils/General.js';

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
                    this.render(datetime, entry);
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

    render(datetime, entry) {
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

        // Add NFT
        if (entry.type === 'add.nft') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/plus.svg',
            title: 'Add NFT',
            subtitle: `Collection: ${shortPrincipalId(entry.nft.canister)}`,
        });
        // Del NFT
        else if (entry.type === 'del.nft') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/minus.svg',
            title: 'Remove NFT'
        });
        // Send NFT
        else if (entry.type === 'send.nft') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send NFT',
            subtitle: `To: ${shortPrincipalId(entry.to.principal)}`,
        });
        // Error send NFT
        else if (entry.type === 'error.send.nft') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send NFT',
            subtitle: `To: ${shortPrincipalId(entry.to.principal)}`,
        });
        // Send Token
        else if (entry.type === 'send.token') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/arrow-up-bold.svg',
            title: 'Send Token',
            subtitle: `To: ${shortPrincipalId(entry.to.principal)}`,
        });
        // Error send token
        else if (entry.type === 'error.send.token') this.renderEntry({
            parent: row,
            icon: 'assets/material-design-icons/bug.svg',
            title: 'Error Send Token',
            subtitle: `To: ${shortPrincipalId(entry.to.principal)}`,
        });

    }

    /**
     * Render one entry
     */

    renderEntry(args) {
        // Icon circle container
        const icon = document.createElement('div');
        icon.classList.add('circle');
        args.parent.append(icon);

        // Icon image
        const image = document.createElement('img');
        image.src = args.icon;
        icon.append(image);

        // Description container
        const desc = document.createElement('div');
        desc.style.marginLeft = '10px';
        args.parent.append(desc);

        // Title
        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = args.title;
        desc.append(title);

        // Subtitle
        if ('subtitle' in args) {
            const subtitle = document.createElement('div');
            subtitle.classList.add('subtitle');
            subtitle.textContent = args.subtitle;
            desc.append(subtitle);
        }
    }

}

