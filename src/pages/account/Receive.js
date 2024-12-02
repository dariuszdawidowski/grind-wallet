import { Component } from '/src/utils/Component.js';
import { Button } from '../../widgets/Button.js';


export class SheetAccountReceive extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        const address = (args.canisterId == this.app.ICP_LEDGER_CANISTER_ID) ? this.wallet.account : this.wallet.principal;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                ${(args.canisterId == this.app.ICP_LEDGER_CANISTER_ID) ? 'Account ID' : 'Principal ID'}
            </h3>
        `;

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
        this.append(buttonCopy);

    }

}
