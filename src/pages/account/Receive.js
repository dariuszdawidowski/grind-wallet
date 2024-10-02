import { Component } from '../../Boost.js';
import { formatCurrency } from '../../Utils.js';
import { Button } from '../../widgets/Button.js';


export class SheetReceiveAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = '<div id="qrcode"></div>';

        const qr = document.createElement('div');
        qr.classList.add('qrcode');
        this.element.append(qr);

        const qrcode = new QRCode(qr, {
            text: args.account,
            width: 200,
            height: 200,
            colorDark : '#000',
            colorLight : '#fff',
            correctLevel : QRCode.CorrectLevel.H
        });

    }

}

