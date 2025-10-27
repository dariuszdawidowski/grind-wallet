/**
 * Page: Import existing account
 */

import { Component } from '/src/utils/component.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';
import { InputText, RecoveryPhrase } from '/src/chrome-extension/popup/widgets/input.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/keys.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/wallet-icp.js';

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
        const newWallet = new ICPWallet({
            blockchain: 'Internet Computer',
            name: this.name.get(),
            publicKey: wallet.public,
            secret: secret
        });
        await newWallet.build(this.app.user.password);
        this.app.wallets.add(newWallet);
        await this.app.wallets.save();
    }

}
