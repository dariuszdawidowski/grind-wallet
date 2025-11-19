/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';
import { StepsBox } from '/src/chrome-extension/popup/widgets/steps.js';
import { Button, ButtLink } from '/src/chrome-extension/popup/widgets/button.js';
import { Copy } from '/src/chrome-extension/popup/widgets/copy.js';
import { shortAddress } from '/src/utils/general.js';
import { dictionary } from '/src/utils/dictionary.js';

export class TaskMintCK extends Task {

    /**
     * Constructor
     */

    constructor({ app, address, amount, symbol, fee, min, started, step = 'begin' } = {}) {
        super({
            app,
            step, // begin | waiting | claim | success | error
            started,
            duration: 20
        });

        // Task details
        this.task.address = address;
        this.task.amount = amount;
        this.task.symbol = symbol;
        this.task.fee = fee;
        this.task.min = min;
        const symbols = this.getSymbol(symbol);
        this.task.description = `Mint ${symbols.to}`;
        const token = dictionary[this.task.symbol];

        // Build
        this.element.classList.add('form');

        // Steps
        this.steps = new StepsBox();
        this.steps.element.style.width = 'calc(100% - 32px)';
        this.steps.step(1, `<h1>Transfer ${token.symbol} to the address below</h1><p>Using any ${token.name} wallet, send the amount of <b>${this.task.amount} ${token.symbol}</b> to the specified minter address. This is the address permanently assigned only to your Principal ID.</p><div id="container-step-1"></div>`);
        this.steps.step(2, `<h1>Wait 15-30 min.</h1><p>Please wait 15 to 30 minutes as usual for your ${this.task.symbol} transfer transaction to complete.</p>`);
        this.steps.step(3, `<h1>Claim ckBTC</h1><p>This window doesn't need to be open at this time. Create a task and periodically check your wallet's homepage to see when you can mint ckBTC.</p><div id="container-step-3"></div>`);
        this.append(this.steps);

        // Reveal BTC address container
        const container1 = this.steps.element.querySelector('#container-step-1');
        const container3 = this.steps.element.querySelector('#container-step-3');

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
        container1.append(qr);

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

        // Button sent
        const buttonSent = new Button({
            text: `OK, I just sent ${token.symbol}`,
            click: () => {
                this.task.step = 'claim';
                this.timer.start();
                this.save();
                buttonSent.hide();
                buttonClaim.show();
                this.app.tasks.update();
            }
        });
        buttonSent.element.style.marginTop = '20px';
        buttonSent.element.style.width = '100%';
        if (this.task.step != 'begin' && this.task.step != 'transfer') buttonSent.element.style.display = 'none';
        container1.append(buttonSent.element);

        // Button claim
        const buttonClaim = new Button({
            text: `Claim ckBTC`,
            click: () => {
            }
        });
        buttonClaim.element.style.marginTop = '20px';
        buttonClaim.element.style.width = '100%';
        if (this.task.step != 'claim') buttonClaim.element.style.display = 'none';
        container3.append(buttonClaim.element);

        // Remove
        this.append(new ButtLink({
            text: `Discard task`,
            classList: ['end'],
            click: () => {
                if (confirm('Delete this Task?')) {
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                    this.del();
                }
            }
        }));

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
            step: this.task.step,
            description: this.task.description,
            created: this.task.created,
            address: this.task.address,
            amount: this.task.amount,
            min: this.task.min,
            symbol: this.task.symbol,
            fee: this.task.fee,
            started: this.timer.started,
            duration: this.timer.duration
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

}
