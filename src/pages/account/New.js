import { Component } from '/src/utils/Component.js';
import { Button } from '../../widgets/Button.js';
import { RecoveryPhrase } from '../../widgets/Input.js';
import { genWalletName } from '../../utils/General.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '../../utils/Keys.js';


export class SheetNewAccount extends Component {

    constructor(args) {
        super(args);
        this.app = args.app;

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
                this.createNewWallet();
            }
        }));

    }

    createNewWallet() {
        const wallet = keysRecoverFromPhraseSecp256k1();
        const crypto = 'ICP';
        const style = 'ICP-01'
        const name = genWalletName(this.app.user.wallets, crypto);
        encryptKey(wallet.private, this.app.user.password).then(encrypted => {
            const secret = serializeEncryptKey(encrypted);
            this.app.user.wallets[wallet.public] = {name, public: wallet.public, secret, crypto, style};
            this.app.save('wallets');
            this.app.create('wallets').then(() => {
                this.app.sheet.clear();
                this.app.sheet.append({
                    title: name,
                    component: new SheetNewAccountPhrase({app: this.app, phrase: wallet.mnemonic})
                });
            });
        });
    }

}


class SheetNewAccountPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Congratulations ! Wallet created.
            </h3>
            <p style="text-align: center;">
                Your 12-words recovery phrase is the only way to recover your account if you lose access to your wallet.
            </p>
            <p style="text-align: center; font-weight: bold;">
                &rarr; Write it down &rarr; Never share it &rarr; Do not lose it
            </p>
        `;

        // Recovery pharse
        this.phrase = new RecoveryPhrase({
            app: args.app,
            id: 'new-account-recovery',
            number: 12,
            phrase: args.phrase,
            readonly: true
        });
        this.append(this.phrase);

        // Button
        this.append(new Button({
            app: args.app,
            id: 'new-account-back',
            text: 'OK',
            click: () => {
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        }));
    }

}

