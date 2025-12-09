/**
 * Transaction history details
 */

import { browser } from '/src/utils/browser.js';
import { Component } from '/src/utils/component.js';
import { shortAddress } from '/src/utils/general.js';
import { SummaryBox } from '/src/extension/popup/widgets/summary.js';
import { ButtLink } from '/src/extension/popup/widgets/button.js';
import { Copy } from '/src/extension/popup/widgets/copy.js';
import { icpt2ICP } from '/src/utils/currency.js';

export class SheetHistoryDetails extends Component {

    constructor({ app, transaction, wallet, recipient }) {
        super({ app });
        
        // Element
        this.element.classList.add('history-details');

        // Date and time
        const dateObj = new Date(transaction.datetime);
        const humanDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const humanTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Date summary box
        this.dateBox = new SummaryBox();
        this.dateBox.row('Date', humanDate);
        this.dateBox.row('Time', humanTime);
        this.append(this.dateBox);

        // Reckognize transaction type
        if (transaction.type.includes('token')) this.renderTokenInfo(transaction, wallet);
        else if (transaction.type.includes('nft')) this.renderNftInfo(transaction);

        // Contractor info
        if (transaction.type.includes('send') || transaction.type.includes('recv')) this.renderContractorInfo(transaction, recipient);

        // Show in dashboard link
        if ('id' in transaction) {
            const transactionLink = new ButtLink({
                text: 'Show in the Internet Computer Dashboard',
                click: () => {
                    browser.tabs.create({ url: `https://dashboard.internetcomputer.org/transaction/${transaction.id}` });
                }
            });
            transactionLink.element.style.marginTop = '20px';
            this.append(transactionLink);
        }

    }

    /**
     * Render token transaction info
     */

    renderTokenInfo(transaction, wallet) {
        // Token header
        const tokenHeader = document.createElement('h2');
        tokenHeader.textContent = 'Token transaction';
        this.element.append(tokenHeader);

        // Token summary box
        this.tokenBox = new SummaryBox();
        this.tokenBox.row('Transaction', transaction.type.startsWith('recv') ? 'Receive' : transaction.type.startsWith('send') ? 'Send' : 'Approve');
        this.tokenBox.row('Token', this.renderTokenInfoLink(transaction.token.canister, wallet));
        this.tokenBox.row('Amount', `${transaction.type.startsWith('recv') ? '+' : '-'}${icpt2ICP(transaction.token.amount)}${transaction.type.includes('error') ? ' (not sent)' : ''}`);
        this.tokenBox.row('Network fee', transaction.token?.fee ? icpt2ICP(transaction.token.fee) : 'N/A');
        this.append(this.tokenBox);
    }

    /**
     * Render NFT info
     */

    renderNftInfo(transaction) {
        // NFT header
        const nftHeader = document.createElement('h2');
        nftHeader.textContent = 'NFT information';
        this.element.append(nftHeader);

        // NFT summary box
        this.nftBox = new SummaryBox();
        this.nftBox.row('Type', transaction.type.startsWith('add') ? 'Add NFT' : transaction.type.startsWith('del') ? 'Remove NFT' : transaction.type.startsWith('recv') ? 'Receive NFT' : transaction.type.startsWith('send') ? 'Send NFT' : 'Unknown');
        this.nftBox.row('Collection canister ID', this.renderCanisterLink(transaction.nft.canister));
        this.nftBox.row('NFT token ID', shortAddress(transaction.nft.id));
        this.append(this.nftBox);
    }

    /**
     * Render contactor info
     */

    renderContractorInfo(transaction, recipient) {
        // Contractor header
        const contractorHeader = document.createElement('h2');
        contractorHeader.textContent = `${transaction.type.includes('recv') ? 'Sender' : transaction.type.includes('send') ? 'Recipient' : 'Contractor'} information`;
        this.element.append(contractorHeader);

        // Contractor summary box
        this.contractorBox = new SummaryBox();
        if (recipient.type == 'own' || recipient.type == 'known') this.contractorBox.row('Name', recipient.name);
        if (transaction.type.startsWith('recv')) this.contractorBox.row('Address', this.renderAddressLink(transaction.from));
        else if (transaction.type.startsWith('send')) this.contractorBox.row('Address', this.renderAddressLink(transaction.to));
        this.contractorBox.row(
            'Trusted',
            recipient.type == 'own' ? 'Yes (own wallet)' :
            recipient.type == 'known' ? 'Yes (from address book)' :
            recipient.type == 'suspicious' ? 'No! Wallet address poisoning suspected (<a href="https://www.google.com/search?q=wallet+poisoning" target="_blank">learn more</a>)' :
            'Unknown'
        );
        this.append(this.contractorBox);
    }

    /**
     * Render address link
     */

    renderAddressLink(address) {
        const container = document.createElement('span');

        if ('account' in address) {
            const accountLink = document.createElement('a');
            accountLink.href = `https://dashboard.internetcomputer.org/account/${address.account}`;
            accountLink.target = '_blank';
            accountLink.textContent = shortAddress(address.account);

            const icon = document.createElement('img');
            icon.src = 'assets/material-design-icons/open-in-new.svg';
            icon.alt = '';

            accountLink.append(icon);
            container.append(accountLink);
        }
        else if ('principal' in address) {
            container.append(shortAddress(address.principal));
        }

        const copyAddr = new Copy({ buffer: address?.account || address?.principal });
        container.append(copyAddr.element);

        return container;
    }

    /**
     * Render canister link
     */

    renderCanisterLink(canisterId) {
        let buffer = '<a href="https://dashboard.internetcomputer.org/canister/' + canisterId + '" target="_blank">';
        buffer += shortAddress(canisterId);
        buffer += '<img src="assets/material-design-icons/open-in-new.svg">';
        buffer += '</a>';
        return buffer;
    }

    /**
     * Render token info link
     */

    renderTokenInfoLink(canisterId, wallet) {
        const token = wallet.tokens.get(canisterId);
        let buffer = '';
        if (token) {
            buffer += `${token.name} (${token.symbol}) `;
            buffer += `<a href="https://dashboard.internetcomputer.org/canister/${canisterId}" target="_blank">`;
            buffer += '<img src="assets/material-design-icons/open-in-new.svg">';
            buffer += '</a>';
        } else {
            buffer += `<a href="https://dashboard.internetcomputer.org/canister/${canisterId}" target="_blank">`;
            buffer += '<img src="assets/material-design-icons/open-in-new.svg">';
            buffer += '</a>';
        }
        return buffer;
    }

}