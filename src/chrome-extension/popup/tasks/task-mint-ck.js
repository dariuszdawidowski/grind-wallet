/**
 * Task: mint Chain-key token
 */

import { CkBTCMinterCanister } from "@dfinity/ckbtc";
import { Task } from './task.js';
import { StepsBox } from '/src/chrome-extension/popup/widgets/steps.js';
import { Button, ButtLink } from '/src/chrome-extension/popup/widgets/button.js';
import { Copy } from '/src/chrome-extension/popup/widgets/copy.js';
import { shortAddress } from '/src/utils/general.js';
import { dictionary } from '/src/utils/dictionary.js';
import { icpt2ICP, formatCurrency } from '/src/utils/currency.js';

export class TaskMintCK extends Task {

    /**
     * Constructor
     */

    constructor({ app, address, amount, symbol, fee, min, started, step = 'transfer', principal } = {}) {
        super({
            app,
            step,
            started,
            duration: 20
        });

        // Task details
        this.task.address = address;
        this.task.amount = amount;
        this.task.symbol = symbol;
        this.task.fee = fee;
        this.task.min = min;
        this.task.principal = principal;
        const symbols = this.getSymbol(symbol);
        this.task.description = `Bridge ${symbols.from} &rarr; ${symbols.to}`;
        const token = dictionary[this.task.symbol];
        this.task.steps = ['transfer', 'wait', 'claim'];

        // Build
        this.element.classList.add('form');

        // Steps
        this.steps = new StepsBox();
        this.steps.element.style.width = 'calc(100% - 32px)';
        this.steps.step(1, `<h1>Transfer ${token.symbol} to the address below</h1><p>Using any ${token.name} wallet, send the amount of <b>${this.task.amount} ${token.symbol}</b> to the specified minter address. This is the address permanently assigned only to your Principal ID.</p><div id="container-step-1"></div>`);
        this.steps.step(2, `<h1>Wait 15-30 min.</h1><p>Please wait 15 to 30 minutes as usual for your ${this.task.symbol} transfer transaction to complete. At least 6 confirmations are required. You can close this window meanwhile.</p>`);
        this.steps.step(3, `<h1>Claim ckBTC</h1><p>You can check periodically to see if it's ready.</p><div id="container-step-3"></div>`);
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
                this.task.step = 'wait';
                this.timer.start();
                this.save();
                buttonSent.hide();
                buttonClaim.show();
                this.app.tasks.update();
            }
        });
        buttonSent.element.style.marginTop = '20px';
        buttonSent.element.style.width = '100%';
        if (this.task.step != 'transfer') buttonSent.element.style.display = 'none';
        container1.append(buttonSent.element);

        // Button claim
        const buttonClaim = new Button({
            text: (this.timer.remainingMinutes() > 5) ? `Check if it's ready` : 'Claim ckBTC',
            click: async () => {
                buttonClaim.busy(true);
                await this.claimUpdateMinter();
                buttonClaim.busy(false);
            }
        });
        buttonClaim.element.style.marginTop = '20px';
        buttonClaim.element.style.width = '100%';
        if (this.task.step != 'wait' && this.task.step != 'claim') buttonClaim.element.style.display = 'none';
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
     * Progress percentage
     */

    progress() {
        const percent = super.progress();
        if (percent >= 100 && this.task.step == 'wait') {
            this.task.step = 'claim';
            this.save();
        }
        this.steps.current(this.task.steps.indexOf(this.task.step) + 1);
        return percent;
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
            duration: this.timer.duration,
            principal: this.task.principal
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

    /**
     * Claim ckBTC (when money arrives)
     */

    async claimUpdateMinter() {
        // Minter canister ID
        const CKBTC_MINTER = process.env.DEV_MODE ?
            'ml52i-qqaaa-aaaar-qaaba-cai' // testnet4
            :
            'mqygn-kiaaa-aaaar-qaadq-cai'; // mainnet
        // Ledger canister ID
        const CKBTC_LEDGER = process.env.DEV_MODE ?
            'mc6ru-gyaaa-aaaar-qaaaq-cai' // ckTESTBTC
            :
            'mxzaz-hqaaa-aaaar-qaada-cai'; // ckBTC
        // Access wallet
        const wallet = this.app.wallets.getByPrincipal(this.task.principal);
        if (!wallet) {
            console.error(`Wallet not found for principal: ${this.task.principal}`);
            return;
        }
        // Access destination token
        const token = wallet.tokens.get(CKBTC_LEDGER);
        if (!token) {
            console.error(`Token ${CKBTC_LEDGER} not found for principal: ${this.task.principal}`);
            return;
        }
        // Create minter actor
        const minter = CkBTCMinterCanister.create({
            agent: wallet.agent,
            canisterId: CKBTC_MINTER,
        });
        // Check if there are new UTXOs
        let balance = null;
        try {
            balance = await minter.updateBalance({});
        }
        // The error is normal behavior to show that the transaction is not yet completed
        catch (_) { }
        if (balance && balance.length && ('Minted' in balance[0]) && ('minted_amount' in balance[0].Minted)) {
            const amount = formatCurrency(icpt2ICP(balance[0].Minted.minted_amount, token.decimals), token.decimals);
            alert(`Succesfully received ${amount} ${token.symbol}`);
            // TODO: remove task
            return;
        }
        alert(`Not ready yet. Bitcoin network operations may take longer than expected.`);
        return;
    }


}
