/**
 * Exchange sheet
 */

import { CkBTCMinterCanister } from "@dfinity/ckbtc";
import { Component } from '/src/utils/component.js';
import { TokenBox } from '/src/chrome-extension/popup/widgets/token-box.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';
import { StepsBox } from '/src/chrome-extension/popup/widgets/steps.js';
import { SummaryBox } from '/src/chrome-extension/popup/widgets/summary.js';
import { Arrow } from '/src/chrome-extension/popup/widgets/arrow.js';
import { icpt2ICP } from '/src/utils/currency.js';

export class SheetAccountExchange extends Component {

    constructor(args) {
        super(args);

        // Wallet
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');

        // Header
        const h3 = document.createElement('h3');
        h3.style.fontWeight = 'bold';
        h3.innerText = 'Currently only one pair available (BTC->ckBTC)';
        this.element.append(h3);

        // Token box (from)
        this.tokenFrom = new TokenBox({
            selected: 'btc',
            onKeypress: this.updateTo.bind(this)
        });
        this.append(this.tokenFrom);

        // Separator arrow
        this.append(new Arrow({ direction: 'down' }));

        /*
        // Send to adress
        this.sendAddress = document.createElement('div');
        this.sendAddress.classList.add('token-box');
        this.element.append(this.sendAddress);

        // QR Code
        const qr = document.createElement('div');
        this.element.append(qr);
        const qrcode = new QRCode(qr, {
            text: 'BTC',
            width: 40,
            height: 40,
            colorDark : '#000',
            colorLight : '#fff',
            correctLevel : QRCode.CorrectLevel.H
        });
        this.sendAddress.append(qr);

        // Send address text
        const sendAddressText = document.createElement('div');
        sendAddressText.innerHTML = 'Transfer BTC to the specified address';
        sendAddressText.style.textAlign = 'center';
        sendAddressText.style.width = '100%';
        this.sendAddress.append(sendAddressText);
        */

        // Steps box
        this.steps = new StepsBox();
        this.steps.step(1, `<h1>Step one</h1><p>Lorem Ipsum jest tekstem stosowanym jako przykładowy wypełniacz w przemyśle poligraficznym. Został po raz pierwszy użyty w XV w. przez nieznanego drukarza do wypełnienia tekstem próbnej książki.</p>`);
        this.steps.step(2, `<h1>Step two</h1><p>Pięć wieków później zaczął być używany przemyśle elektronicznym, pozostając praktycznie niezmienionym.</p>`);
        this.steps.step(3, `<h1>Step three</h1><p>Spopularyzował się w latach 60. XX w. wraz z publikacją arkuszy Letrasetu, zawierających fragmenty Lorem Ipsum.</p>`);
        this.append(this.steps);

        // Separator arrow
        this.append(new Arrow({ direction: 'down' }));

        // Token box (to)
        this.tokenTo = new TokenBox({
            selected: 'ckbtc',
            onKeypress: this.updateFrom.bind(this)
        });
        this.append(this.tokenTo);

        // Transaction summary
        this.summary = new SummaryBox();
        this.summary.row('Provider', 'Dfinity Chain-Key minter canister');
        this.summary.row('Delay', 'Up to 20 min.');
        this.summary.row('Minter fee', '? BTC');
        this.summary.element.style.marginTop = '16px';
        this.append(this.summary);

        // Exchange button
        const buttonExchange = new Button({
            text: 'Reveal BTC transfer address',
            click: () => {
                this.mintBTC2ckBTC();
            }
        });
        buttonExchange.element.style.margin = '18px auto';
        this.append(buttonExchange);

        // Description
        this.append(new ButtonDescription({
            app: this.app,
            text: `Read more about Chain-Key technology <a href="https://internetcomputer.org/chainfusion" target="_blank">HERE</a>`
        }));

    }

    /**
     * Update 'from' value
     */

    updateFrom(data) {
        const exchange = this.convert({
            from: this.tokenFrom.getSymbol(),
            to: this.tokenTo.getSymbol(),
            amount: data.value
        });
        this.tokenFrom.setValue(exchange);
    }

    /**
     * Update 'to' value
     */

    updateTo(data) {
        const exchange = this.convert({
            from: this.tokenTo.getSymbol(),
            to: this.tokenFrom.getSymbol(),
            amount: data.value
        });
        this.tokenTo.setValue(exchange);
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
     * BTC -> ckBTC minter
     */

    async mintBTC2ckBTC() {
        const CKBTC_MINTER = 'mqygn-kiaaa-aaaar-qaadq-cai';
        const CKBTC_MINTER_TESTNET4 = 'ml52i-qqaaa-aaaar-qaaba-cai';
        //const CKBTC_CHECKER = 'oltsj-fqaaa-aaaar-qal5q-cai';
        const minter = CkBTCMinterCanister.create({
            agent: this.wallet.agent,
            canisterId: CKBTC_MINTER_TESTNET4,
        });
        console.log(minter);
        const btcAddress = await minter.getBtcAddress({});
        console.log(btcAddress);
        // const fee = await minter.service.get_deposit_fee();
        // console.log(fee);
        const info = await minter.getMinterInfo({});
        console.log(info)
        this.summary.row('Minter fee', `${icpt2ICP(info.kyt_fee, 8)} BTC`);
        // Manually Send here
        // ....
        // Claim ckBTC (when money arrives)
        // const balance = await minter.updateBalance({});
        // console.log(balance[0].Minted.minted_amount)
        
    }

}
