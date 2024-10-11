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
        this.wallet = this.app.user.wallets[this.public];

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

        this.append(new Button({
            app: args.app,
            id: 'send-account-ok',
            text: 'Send',
            click: () => {
                icpLedgerTransfer(
                    this.app.icp.ledger.actor,
                    this.address.get(),
                    AccountIdentifier.fromPrincipal({ principal: Principal.fromText(this.address.get()) }),
                    this.amount.get()
                ).then(result => console.log(result));
            }
        }));

    }

}

