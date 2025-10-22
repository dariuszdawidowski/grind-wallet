import { Component } from '/src/utils/Component.js';
import { Button, ButtonDescription } from '/src/widgets/button.js';
import { InputText, RecoveryPhrase } from '/src/widgets/input.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/Keys.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/icp-wallet.js';

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
            value: this.app.wallets.genNextWalletName('ICP'),
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
        this.app.wallets.add(new ICPWallet({
            blockchain: 'Internet Computer',
            name: this.name.get(),
            publicKey: wallet.public,
            secret: secret
        }));
        await this.app.wallets.get(wallet.public).rebuild(this.app.user.password);
        this.app.saveWallets();
    }

}
