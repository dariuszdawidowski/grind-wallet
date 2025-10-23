import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';

export class SheetAccountReceiveNFT extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Principal ID
        const address = this.wallet.principal;

        // Build
        this.element.classList.add('form');

        // Header
        const h3 = document.createElement('h3');
        h3.style.fontWeight = 'bold';
        h3.innerText = 'Principal ID';
        this.element.append(h3);

        // Show address
        const addr = document.createElement('div');
        addr.classList.add('address');
        addr.classList.add('principal');
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
            text: 'Copy address to clipboard',
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
