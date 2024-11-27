import { Component } from '/src/utils/Component.js';
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
        if (this.phrase.valid()) {
            const phrase = this.phrase.get();
            const wallet = keysRecoverFromPhraseSecp256k1(phrase.join(' '));
            const blockchain = 'Internet Computer';
            const name = genWalletName(this.app.user.wallets, crypto);
            encryptKey(wallet.private, this.app.user.password).then(encrypted => {
                const secret = serializeEncryptKey(encrypted);
                this.app.user.wallets[wallet.public] = {blockchain, name, public: wallet.public, secret};
                this.app.save('wallets', this.app.user.wallets);
                this.app.create('wallets').then(() => {
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                });
            });
        }
        else {
            alert('Invalid recovery phrase');
        }
    }

}
