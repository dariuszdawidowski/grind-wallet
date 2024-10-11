import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../widgets/Button.js';
import { RecoveryPhrase } from '../../widgets/Input.js';
import { genWalletName } from '../../utils/General.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '../../utils/Keys.js';


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
                this.importNewWallet();
            }
        }));

        // Description
        this.append(new ButtonDescription({
            app: args.app,
            text: 'If you enter an incorrect phrase, a new account will<br>be created based on it.'
        }));
    }

    importNewWallet() {
        const wallet = keysRecoverFromPhraseSecp256k1(this.phrase.get().join(' '));
        const crypto = 'ICP';
        const style = 'ICP-01'
        const name = genWalletName(this.app.user.wallets, crypto);
        encryptKey(wallet.private, this.app.user.password).then(encrypted => {
            const secret = serializeEncryptKey(encrypted);
            this.app.user.wallets[wallet.public] = {name, public: wallet.public, secret, crypto, style};
            this.app.save('wallets');
            this.app.create('wallets').then(() => {
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            });
        });
    }

}
