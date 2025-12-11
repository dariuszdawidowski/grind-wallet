/**
 * Receive Token Sheet
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/extension/popup/widgets/button.js';
import { formatWithSpaces } from '/src/utils/currency.js';

export class SheetAccountReceive extends Component {

    constructor({ app, wallet, canister }) {
        super({ app });

        // Wallet
        this.wallet = wallet;

        // Build
        this.element.classList.add('form');

        // Render both Principal ID and Account ID for mail "card"
        if (canister.ledgerId == this.app.ICP_LEDGER_CANISTER_ID) {
            this.render({ name: 'Principal ID', address: this.wallet.principal });
            // Separator
            const sep = document.createElement('hr');
            sep.style.marginTop = '18px';
            this.element.append(sep);
            this.render({ name: 'Account ID', address: this.wallet.account });
        }

        // Render only principal for custom token
        else {
            this.render({ name: 'Principal ID', address: this.wallet.principal });
        }

        // End separator
        const end = document.createElement('div');
        end.classList.add('end');
        this.element.append(end);

    }

    /**
     * Render given string as header + QR code + subtitle
     */

    render({ name, address }) {

        // Header
        const h3 = document.createElement('h3');
        h3.style.fontWeight = 'bold';
        h3.innerText = name;
        this.element.append(h3);

        // Show address
        const addr1 = document.createElement('div');
        addr1.style.marginBottom = '2px';
        addr1.classList.add('address');
        const addr2 = document.createElement('div');
        addr2.classList.add('address');
        if (name === 'Account ID') {
            addr1.classList.add('account');
            addr1.textContent = formatWithSpaces(address.substring(0, 32), 4);
            addr2.classList.add('account');
            addr2.textContent = formatWithSpaces(address.substring(32), 4);

        }
        else if (name === 'Principal ID') {
            addr1.classList.add('principal');
            addr1.textContent = address.substring(0, 24);
            addr2.classList.add('principal');
            addr2.textContent = address.substring(24);
        }
        this.element.append(addr1);
        this.element.append(addr2);

        // QR Code
        const qr = document.createElement('div');
        qr.classList.add('qrcode');
        this.element.append(qr);
        const qrcodePrincipal = new QRCode(qr, {
            text: address,
            width: 200,
            height: 200,
            colorDark : '#000',
            colorLight : '#fff',
            correctLevel : QRCode.CorrectLevel.H
        });

        const buttonCopy = new Button({
            text: `Copy ${name} to clipboard`,
            click: () => {
                navigator.clipboard.writeText(address).then(() => {
                    buttonCopy.set('Copied!');
                }).catch(err => {
                });
            }
        });
        buttonCopy.element.style.margin = '18px auto';
        this.append(buttonCopy);

    }

}
