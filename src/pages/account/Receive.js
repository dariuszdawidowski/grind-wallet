import { Component } from '../../Boost.js';
import { Button } from '../../widgets/Button.js';


export class SheetAccountReceive extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');

        const qr = document.createElement('div');
        qr.classList.add('qrcode');
        this.element.append(qr);

        const qrcode = new QRCode(qr, {
            text: this.wallet.account,
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
                navigator.clipboard.writeText(this.wallet.account).then(() => {
                }).catch(err => {
                });
            }
        }));

    }

}
