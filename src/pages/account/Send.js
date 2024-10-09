import { Component } from '../../Boost.js';
import { formatCurrency } from '../../utils/Currency.js';
import { Button } from '../../widgets/Button.js';
import { InputCurrency, InputAccount } from '../../widgets/Input.js';


export class SheetAccountSend extends Component {

    constructor(args) {
        super(args);
        console.log('T1', this)

        // Build
        this.element.classList.add('form');

        this.append(new InputCurrency({
            app: args.app,
            id: 'send-account-amount',
            placeholder: formatCurrency(0, 8),
            symbol: 'ICP'
        }));

        this.append(new InputAccount({
            app: args.app,
            id: 'send-account-address',
            placeholder: 'Account ID'
        }));

        this.append(new Button({
            app: args.app,
            id: 'send-account-ok',
            text: 'Send',
            click: () => {
            }
        }));

    }

}

