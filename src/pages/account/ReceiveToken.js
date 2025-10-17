import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/button.js';


export class SheetAccountReceive extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');

        // Render both Principal ID and Account ID for mail "card"
        if (args.canisterId == this.app.ICP_LEDGER_CANISTER_ID) {
            this.render({ name: 'Principal ID', address: this.wallet.principal });
            this.render({ name: 'Account ID', address: this.wallet.account });
        }

        // Render only principal for custom token
        else {
            this.render({ name: 'Principal ID', address: this.wallet.principal });
        }

    }

    /**
     * Render given string as header + QR code + subtitle
     */

    render({ name, address }) {

        // Header
        const h3 = document.createElement('h3');
        h3.innerText = name;
        this.element.append(h3);

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
        this.append(buttonCopy);

        // Show address
        const addr = document.createElement('div');
        addr.style.textAlign = 'center';
        addr.innerText = address;
        this.element.append(addr);

    }

}
