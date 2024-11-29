import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { RecoveryPhrase } from '/src/widgets/Input.js';
import { genWalletName } from '/src/utils/General.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/Keys.js';
import { icpRebuildWallet } from '/src/blockchain/InternetComputer/Wallet.js';


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
            text: 'Proceed',
            click: () => {
                this.createNewWallet();
            }
        }));

    }

    async createNewWallet() {
        const wallet = keysRecoverFromPhraseSecp256k1();
        const blockchain = 'Internet Computer';
        const name = genWalletName(this.app.user.wallets, 'ICP');
        const encrypted = await encryptKey(wallet.private, this.app.user.password);
        const secret = serializeEncryptKey(encrypted);
        this.app.user.wallets[wallet.public] = await icpRebuildWallet({blockchain, name, public: wallet.public, secret}, this.app.user.password);
        this.app.save('wallets', this.app.user.wallets);
        this.app.sheet.clear();
        this.app.sheet.append({
            title: name,
            component: new SheetNewAccountPhrase({app: this.app, phrase: wallet.mnemonic})
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
            number: 12,
            phrase: args.phrase,
            readonly: true
        });
        this.append(this.phrase);

        // Button
        this.append(new Button({
            text: 'OK',
            click: () => {
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        }));
    }

}

