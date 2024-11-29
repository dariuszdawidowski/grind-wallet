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

        // Canister ID
        this.canisterId = args.canisterId;

        // Sucessfuly sent
        this.sent = false;

        // Build
        this.element.classList.add('form');

        this.amount = new InputCurrency({
            placeholder: formatCurrency(0, this.wallet.tokens[this.canisterId].decimals),
            symbol: this.wallet.tokens[this.canisterId].symbol
        });
        this.append(this.amount);

        this.address = new InputAddress({
            placeholder: this.canisterId == this.app.ICP_LEDGER_CANISTER_ID ? 'Principal ID or Account ID' : 'Principal ID'
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
        /*if (this.app.info.fee == null) {
            icpLedgerFee(this.wallet.tokens[this.app.ICP_LEDGER_CANISTER_ID].actor).then(fee => {
                if (typeof(fee) == 'bigint') {
                    this.app.info.fee = fee;
                    document.querySelector('#fee').innerHTML = formatE8S(this.app.info.fee);
                }
            });
        }*/

    }

    transfer() {

        // Principal ID
        let principal = null;

        // Account ID
        let account = null;

        // Autodetect Principal ID
        if (this.address.detect() == 'principal') {
            try {
                principal = Principal.fromText(this.address.get());
                account = AccountIdentifier.fromPrincipal({ principal });
            }
            catch(error) {
                alert('Invalid Principal ID');
            }
        }

        // Autodetect Account ID
        else {
            try {
                account = AccountIdentifier.fromHex(this.address.get());
            }
            catch(error) {
                alert('Invalid Account ID');
            }
        }

        // Ok to transfer
        if (account) {
            this.submit.busy(true);
            this.wallet.tokens[this.canisterId].request.transfer({
                principal,
                account,
                amount: this.amount.get()
            }).then(result => {
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

