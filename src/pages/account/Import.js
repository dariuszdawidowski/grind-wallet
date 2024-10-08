import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../widgets/Button.js';
import { RecoveryPhrase } from '../../widgets/Input.js';


export class SheetImportAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                This action will import the Internet Computer<br>
                blockchain account from the recovery phrase.
            </h3>
        `;

        // Recovery pharse
        this.phrase = new RecoveryPhrase({
            app: args.app,
            id: 'import-account-recovery',
            number: 12
        });
        this.append(this.phrase);

        // Button
        this.append(new Button({
            app: args.app,
            id: 'import-account-proceed',
            text: 'Proceed',
            click: () => {
                const wallet = this.app.icp.keysRecoverFromPhrase(this.phrase.get().join(' '));
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
            text: 'If you enter an incorrect phrase, a new account will<br>be created based on it.'
        }));
    }

}
