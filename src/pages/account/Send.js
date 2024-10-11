import { Component } from '../../Boost.js';
import { formatCurrency } from '../../utils/Currency.js';
import { Button } from '../../widgets/Button.js';
import { InputCurrency, InputAccount } from '../../widgets/Input.js';
import { icpLedgerTransfer } from '../../utils/Transactions.js';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

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
            app: args.app,
            id: 'send-account-amount',
            placeholder: formatCurrency(0, 8),
            symbol: 'ICP'
        });
        this.append(this.amount);

        this.address = new InputAccount({
            app: args.app,
            id: 'send-account-principal',
            placeholder: 'Principal ID'
        });
        this.append(this.address);

        this.submit = new Button({
            app: args.app,
            id: 'send-account-ok',
            text: 'Send',
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    this.transfer();
                }
                // Succesful sent
                else {
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        });
        this.append(this.submit);

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
                this.wallet.actor,
                this.address.get(),
                account,
                this.amount.get()
            ).then(result => {
                this.submit.busy(false);
                if ('Ok' in result) {
                    this.submit.set('OK');
                    this.sent = true;
                }
                else {
                    alert(result);
                }
                console.log(result)
            });
        }
    }

}

