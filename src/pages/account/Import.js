import { Component } from '/src/utils/Component.js';
import { Button, ButtonDescription } from '/src/widgets/Button.js';
import { InputText, RecoveryPhrase } from '/src/widgets/Input.js';
import { genWalletName } from '/src/utils/General.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/Keys.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/ICPWallet.js';

export class SheetImportAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');

        // H3
        const header = document.createElement('h3');
        header.innerHTML = `
            This action will import the Internet Computer<br>
            blockchain account from the recovery phrase.
        `;
        this.element.append(header);

        // Name
        this.name = new InputText({
            value: genWalletName(this.app.user.wallets, 'ICP'),
            placeholder: 'Wallet name'
        });
        this.append(this.name);

        // Recovery pharse
        this.phrase = new RecoveryPhrase({
            number: 12
        });
        this.append(this.phrase);

        // Button
        this.append(new Button({
            text: 'Proceed',
            click: () => {
                if (this.phrase.valid()) {
                    this.importNewWallet().then(() => {
                        this.app.page('accounts');
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    });
                }
                else {
                    alert('Invalid recovery phrase');
                }
            }
        }));

        // Description
        this.append(new ButtonDescription({
            text: 'If you enter an incorrect phrase, a new account will<br>be created based on it.'
        }));
    }

    async importNewWallet() {
        const wallet = keysRecoverFromPhraseSecp256k1(this.phrase.get().join(' '));
        const encrypted = await encryptKey(wallet.private, this.app.user.password);
        const secret = serializeEncryptKey(encrypted);
        this.app.user.wallets[wallet.public] = new ICPWallet({
            blockchain: 'Internet Computer',
            name: this.name.get(),
            publicKey: wallet.public,
            secret: secret
        });
        await this.app.user.wallets[wallet.public].rebuild(this.app.user.password);
        this.app.save('wallets', this.app.user.wallets);
    }

}
