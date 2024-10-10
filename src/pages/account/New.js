import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../widgets/Button.js';


export class SheetNewAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                This action will create a new free account<br>
                for the Internet Computer blockchain.
            </h3>
        `;

        // Buttons
        this.append(new Button({
            app: args.app,
            id: 'create-account-proceed',
            text: 'Proceed',
            click: () => {
                const wallet = this.app.icp.keysRecoverFromPhrase();
                this.app.user.wallets[wallet.public] = {'name': 'ICP #1', 'public': wallet.public, 'private': wallet.private, 'crypto': 'ICP', style: 'ICP-01'};
                this.app.save('wallets');
                this.app.create('wallets');
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        }));

        // Description
        this.append(new ButtonDescription({
            app: args.app,
            text: 'The actual creation will take place with the first transaction,<br>until now it will only be kept in the application.'
        }));
    }

}
