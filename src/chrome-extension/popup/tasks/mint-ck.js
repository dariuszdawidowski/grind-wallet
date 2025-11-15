/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';
import { StepsBox } from '/src/chrome-extension/popup/widgets/steps.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { Copy } from '/src/chrome-extension/popup/widgets/copy.js';
import { shortAddress } from '/src/utils/general.js';

export class TaskMintCK extends Task {

    /**
     * Constructor for minting Chain-key token task
     */

    constructor({ app, address, amount, symbol, fee, min } = {}) {
        super({ app, duration: -1 });

        // Task details
        this.task.address = address;
        this.task.amount = amount;
        this.task.symbol = symbol;
        this.task.fee = fee;
        this.task.min = min;
        const symbols = this.getSymbol(symbol);
        this.task.description = `Mint ${symbols.to}`;

        // Build
        this.element.classList.add('form');

        // Steps
        this.steps = new StepsBox();
        this.steps.element.style.width = 'calc(100% - 32px)';
        this.steps.step(1, `<h1>Transfer ${this.task.symbol} to the address below</h1><p>Using any Bitcoin wallet, send the amount of <b>${this.task.amount} ${this.task.symbol}</b> to the specified minter address. This is the address permanently assigned only to your Principal ID.</p><div id="reveal-btc-container"></div>`);
        this.steps.step(2, `<h1>Wait 15-30 min.</h1><p>Please wait 15 to 30 minutes as usual for your ${this.task.symbol} transfer transaction to complete.</p>`);
        this.steps.step(3, `<h1>Claim ckBTC</h1><p>This window doesn't need to be open at this time. Create a task and periodically check your wallet's homepage to see when you can mint ckBTC.</p>`);
        this.append(this.steps);

        // Reveal BTC address container
        const container = this.steps.element.querySelector('#reveal-btc-container');

        // QR Code
        const qr = document.createElement('div');
        qr.style.display = 'flex';
        qr.style.alignItems = 'center';
        qr.style.marginTop = '20px';
        this.element.append(qr);
        const qrcode = new QRCode(qr, {
            text: this.task.address,
            width: 120,
            height: 120,
            colorDark : '#000',
            colorLight : '#e7e7e7',
            correctLevel : QRCode.CorrectLevel.H
        });
        container.append(qr);

        // Address text
        const showAddr = document.createElement('div');
        showAddr.style.marginLeft = '20px';
        showAddr.style.display = 'flex';
        showAddr.style.alignItems = 'center';
        showAddr.style.justifyContent = 'center';
        showAddr.innerText = shortAddress(this.task.address);
        qr.append(showAddr);

        // Copy to clipboard icon
        const copyAddr = new Copy({ text: this.task.address });
        qr.append(copyAddr.element);

        // Button
        const buttonDone = new Button({
            text: 'Done',
            click: () => {
            }
        });
        buttonDone.element.style.marginTop = '20px';
        buttonDone.element.style.width = '100%';
        container.append(buttonDone.element);

    }

    /**
     * Get symbol from
     */

    getSymbol(symbol) {
        switch (symbol.toLowerCase()) {
            case 'btc':
                return { from: 'BTC', to: 'ckBTC' };
            default:
                return { from: '', to: '' };
        }
    }

    /**
     * Serialize task data
     */

    serialize() {
        return {
            class: 'TaskMintCK',
            description: this.task.description,
            created: this.task.created,
            duration: this.task.duration,
            address: this.task.address,
            amount: this.task.amount,
            min: this.task.min,
            symbol: this.task.symbol,
            fee: this.task.fee
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

}
