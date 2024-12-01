import { Component } from '/src/utils/Component.js';
import { Button } from '../../widgets/Button.js';


export class SheetAccountReceive extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Principal ID
            </h3>
        `;

        // QR Code for Principal ID
        const qrPrincipal = document.createElement('div');
        qrPrincipal.classList.add('qrcode');
        this.element.append(qrPrincipal);

        const qrcodePrincipal = new QRCode(qrPrincipal, {
            text: this.wallet.principal,
            width: 200,
            height: 200,
            colorDark : '#000',
            colorLight : '#fff',
            correctLevel : QRCode.CorrectLevel.H
        });

        this.append(new Button({
            app: args.app,
            id: 'receive-account-copy',
            text: 'Copy address to clipboard',
            click: () => {
                navigator.clipboard.writeText(this.wallet.principal).then(() => {
                }).catch(err => {
                });
            }
        }));

    }

}
