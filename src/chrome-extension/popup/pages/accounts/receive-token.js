import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';


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
        const addr = document.createElement('div');
        addr.classList.add('address');
        if (name === 'Account ID') addr.classList.add('account');
        else if (name === 'Principal ID') addr.classList.add('principal');
        addr.innerText = address;
        this.element.append(addr);

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
