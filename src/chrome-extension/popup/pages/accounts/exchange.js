/**
 * Exchange sheet
 */

import { CkBTCMinterCanister } from "@dfinity/ckbtc";
import { Component } from '/src/utils/component.js';
import { TokenBox } from '/src/chrome-extension/popup/widgets/token-box.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';
// import { StepsBox } from '/src/chrome-extension/popup/widgets/steps.js';
import { SummaryBox } from '/src/chrome-extension/popup/widgets/summary.js';
// import { Copy } from '/src/chrome-extension/popup/widgets/copy.js';
import { Arrow } from '/src/chrome-extension/popup/widgets/arrow.js';
import { icpt2ICP } from '/src/utils/currency.js';
// import { shortAddress } from '/src/utils/general.js';
import { TaskMintCK } from '/src/chrome-extension/popup/tasks/mint-ck.js';
import { ONE_WEEK } from '/src/utils/general.js';

export class SheetAccountExchange extends Component {

    constructor(args) {
        super(args);

        // Current token
        const token = args.wallet.tokens.get(args.canister.ledgerId);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');

        // Header
        const h3 = document.createElement('h3');
        h3.style.fontWeight = 'bold';
        if (token.symbol != 'ckBTC') h3.innerHTML = `${token.symbol} token exchange is not implemented yet.<br>Currently only one pair available (BTC&rarr;ckBTC)`;
        else  h3.innerHTML = `Mint BTC&rarr;ckBTC`;
        this.element.append(h3);

        // Token box (from)
        this.tokenFrom = new TokenBox({
            selected: 'btc',
            onKeypress: this.handleFromInput.bind(this)
        });
        this.append(this.tokenFrom);

        // Separator arrow
        this.append(new Arrow({ direction: 'down' }));

        // Steps box
        /*
        this.steps = new StepsBox();
        this.steps.step(1, `<h1>Transfer BTC to the address below</h1><p>Using any Bitcoin wallet, send the amount of <b><span id="amount-of-btc"></span> BTC</b> to the specified minter address. This is the address permanently assigned only to your Principal ID.</p><div id="reveal-btc-container"></div>`);
        this.steps.step(2, `<h1>Wait 15-30 min.</h1><p>Please wait 15 to 30 minutes as usual for your BTC transfer transaction to complete.</p>`);
        this.steps.step(3, `<h1>Claim ckBTC</h1><p>This window doesn't need to be open at this time. Create a task and periodically check your wallet's homepage to see when you can mint cbBTC.</p>`);
        this.append(this.steps);*/

        // Internal selectors
        // this.amountOfBtc = this.steps.element.querySelector('#amount-of-btc');
        // const revealBtcContainer = this.steps.element.querySelector('#reveal-btc-container');
/*
        // Reveal address button
        const buttonReveal = new Button({
            text: 'Reveal BTC address',
            click: async () => {
                buttonReveal.busy(true);
                this.info = await this.revealBTCAddress();
                buttonReveal.busy(false);
                if (this.info.ok === true) {
                    // Show address instead of button                    
                    buttonReveal.hide();
                    this.renderBTCAddress(revealBtcContainer);
                    // Display minimal amount
                    this.tokenFrom.amount.note(`min. ${icpt2ICP(this.info.min, 8)}`);
                    // Display fee
                    this.summary.row('Minter fee', `${icpt2ICP(this.info.fee, 8)} BTC`);
                    // Display fee into
                    this.tokenTo.amount.note(`${icpt2ICP(this.info.fee, 8)} fee included`);
                    // Recalculate 'to'
                    const exchange = this.convert({
                        from: this.tokenTo.getSymbol(),
                        to: this.tokenFrom.getSymbol(),
                        amount: this.tokenFrom.getValue(),
                    });
                    this.tokenTo.setValue(exchange - (('fee' in this.info) ? icpt2ICP(this.info.fee, 8) : 0));
                }
                else {
                    alert('Failed to reveal BTC address. Please try again later.');
                }
            }
        });
        buttonReveal.element.style.width = '100%';
        buttonReveal.element.style.marginBottom = '0';
        revealBtcContainer.append(buttonReveal.element);
*/
        // Separator arrow
        this.append(new Arrow({ direction: 'down' }));

        // Token box (to)
        this.tokenTo = new TokenBox({
            selected: 'ckbtc',
            onKeypress: this.handleToInput.bind(this)
        });
        this.append(this.tokenTo);

        // Transaction summary
        this.summary = new SummaryBox();
        this.summary.row('Provider', 'Dfinity Chain-Key minter');
        this.summary.row('Delay', '~20 min.');
        this.summary.row('Minter fee', '? BTC');
        this.summary.element.style.marginTop = '16px';
        this.append(this.summary);

        // Create task button
        this.buttonTask = new Button({
            text: 'Create 3-steps task',
            click: () => {
                this.app.tasks.add(new TaskMintCK({
                    address: this.info.address,
                    symbol: this.tokenFrom.getSymbol(),
                    amount: this.tokenFrom.getValue() || 0,
                    min: this.info.min,
                    fee: this.info.fee
                }));
                this.app.tasks.update();
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        });
        this.buttonTask.element.style.margin = '18px auto';
        this.buttonTask.disable();
        this.buttonTask.busy(true);
        this.append(this.buttonTask);

        // Description
        this.append(new ButtonDescription({
            app: this.app,
            text: `Read more about Chain-Key technology <a href="https://internetcomputer.org/chainfusion" target="_blank">HERE</a>`
        }));

        // Fetch minter info
        (async () => {
            this.info = await this.app.cache.storage.get({
                id: `mintinfo:${this.wallet.principal}:ckbtc`,
                overdue: ONE_WEEK,
                create: async () => {
                    const info = await this.revealBTCAddress();
                    if (info.ok === true) return { address: info.address, fee: Number(info.fee), min: Number(info.min)};
                    return null;
                }
            });
            this.buttonTask.busy(false);
            if (this.info) {
                // Display minimal amount
                this.tokenFrom.amount.note(`min. ${icpt2ICP(this.info.min, 8)}`);
                // Display fee
                this.summary.row('Minter fee', `${icpt2ICP(this.info.fee, 8)} BTC`);
                // Display fee into
                this.tokenTo.amount.note(`${icpt2ICP(this.info.fee, 8)} fee included`);
                // Recalculate 'to'
                if (this.tokenFrom.getValue() > 0) this.handleFromInput({ value: this.tokenFrom.getValue() });
            }
            else {
                alert('Failed to reveal BTC address. Please try again later.');
            }
        })();

    }

    /**
     * Type in 'from' value
     */

    handleFromInput(data) {
        const exchange = this.convert({
            from: this.tokenTo.getSymbol(),
            to: this.tokenFrom.getSymbol(),
            amount: data.value,
        });
        this.tokenTo.setValue(exchange - (('fee' in this.info) ? icpt2ICP(this.info.fee, 8) : 0));
        if ('min' in this.info) {
            if (data.value >= icpt2ICP(this.info.min, 8)) {
                this.tokenFrom.error(false);
                this.buttonTask.enable();
            }
            else {
                this.tokenFrom.error(true);
                this.buttonTask.disable();
            }
        }
    }

    /**
     * Type in 'to' value
     */

    handleToInput(data) {
        const exchange = this.convert({
            from: this.tokenFrom.getSymbol(),
            to: this.tokenTo.getSymbol(),
            amount: data.value
        });
        this.tokenFrom.setValue(exchange + (('fee' in this.info) ? icpt2ICP(this.info.fee, 8) : 0));
        if ('min' in this.info) {
            if (data.value >= icpt2ICP(this.info.min, 8)) {
                this.tokenFrom.error(false);
                this.buttonTask.enable();
            }
            else {
                this.tokenFrom.error(true);
                this.buttonTask.disable();
            }
        }
    }

    /**
     * Convert tokens with ratio (TODO: in a future change to global registry fetched and cached from a service canister)
     */

    convert({ from, to, amount }) {
        // Exchange rates with BTC as referential 1
        const rates = {
            'btc': 1,
            'ckbtc': 1
        };
        const amountInBTC = amount / rates[from];
        return amountInBTC * rates[to];
    }

    /**
     * Reveal BTC address
     */

    async revealBTCAddress() {
        // Minter canister ID (testnet4 : mainnet)
        const CKBTC_MINTER = process.env.DEV_MODE ? 'ml52i-qqaaa-aaaar-qaaba-cai' : 'mqygn-kiaaa-aaaar-qaadq-cai';
        // Create minter actor
        if (!this.minter) this.minter = CkBTCMinterCanister.create({
            agent: this.wallet.agent,
            canisterId: CKBTC_MINTER,
        });
        // Reveal BTC address
        const btcAddress = await this.minter.getBtcAddress({});
        // Get info about fee & minimal amount
        const info = await this.minter.getMinterInfo({});
        if (btcAddress && ('kyt_fee' in info) && ('retrieve_btc_min_amount' in info)) { 
            return { ok: true, fee: info.kyt_fee, min: info.retrieve_btc_min_amount, address: btcAddress };
        }
        return { ok: false };
    }

    /**
     * Render BTC address
     */
/*
    async renderBTCAddress(container) {

        // QR Code
        const qr = document.createElement('div');
        qr.style.display = 'flex';
        qr.style.alignItems = 'center';
        qr.style.marginTop = '20px';
        this.element.append(qr);
        const qrcode = new QRCode(qr, {
            text: this.info.address,
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
        showAddr.innerText = shortAddress(this.info.address);
        qr.append(showAddr);

        // Copy to clipboard icon
        const copyAddr = new Copy({ text: this.info.address });
        qr.append(copyAddr.element);
    }
*/
    /**
     * Claim ckBTC (when money arrives)
     */
/*
    async claimUpdateMinter() {
        const balance = await minter.updateBalance({});
        console.log(balance[0].Minted.minted_amount)
    }
*/
}
