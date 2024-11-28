import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Component } from '/src/utils/Component.js';
import { formatCurrency, formatE8S } from '/src/utils/Currency.js';
import { Button, ButtonDescription } from '/src/widgets/Button.js';
import { InputCurrency, InputAddress } from '/src/widgets/Input.js';
import { icpLedgerTransfer, icpLedgerFee } from '/src/blockchain/InternetComputer/Ledger.js';

export class SheetAccountSend extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Sucessfuly sent
        this.sent = false;

        // Build
        this.element.classList.add('form');

        this.amount = new InputCurrency({
            placeholder: formatCurrency(0, 8),
            symbol: 'ICP'
        });
        this.append(this.amount);

        this.address = new InputAddress({
            placeholder: 'Principal ID'
        });
        this.append(this.address);

        this.submit = new Button({
            text: 'Send',
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (this.amount.valid()) this.transfer();
                    else alert('Invalid amount');
                }
                // Succesful sent
                else {
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        });
        this.append(this.submit);

        // Description
        this.append(new ButtonDescription({
            app: args.app,
            text: `The network charges a commission of <span id="fee">${this.app.info.fee ? formatE8S(this.app.info.fee) : 'unknown'}</span> ICP.<br>Sending to an unsupported address may result in loss of tokens.`
        }));

        // Cache fee
        if (this.app.info.fee == null) {
            icpLedgerFee(this.wallet.tokens[this.app.ICP_LEDGER_CANISTER_ID].actor).then(fee => {
                if (typeof(fee) == 'bigint') {
                    this.app.info.fee = fee;
                    document.querySelector('#fee').innerHTML = formatE8S(this.app.info.fee);
                }
            });
        }

    }

    transfer() {
        let principal = null;
        let account = null;
        try {
            principal = Principal.fromText(this.address.get());
            account = AccountIdentifier.fromPrincipal({ principal });
        }
        catch(error) {
            alert('Invalid Principal ID');
        }
        if (principal && account) {
            this.submit.busy(true);
            icpLedgerTransfer(
                this.wallet.tokens[this.app.ICP_LEDGER_CANISTER_ID].actor,
                account,
                this.amount.get()
            ).then(result => {
                this.submit.busy(false);
                if ('OK' in result) {
                    this.submit.set('OK');
                    this.sent = true;
                }
                else if ('ERROR' in result) {
                    alert(result.ERROR);
                }
                else {
                    alert('Transfer error');
                }
            });
        }
    }

}

