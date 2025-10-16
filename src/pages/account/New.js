import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/button.js';
import { InputText, RecoveryPhrase } from '/src/widgets/input.js';
import { genWalletName } from '/src/utils/General.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/Keys.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/ICPWallet.js';

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
        const encrypted = await encryptKey(wallet.private, this.app.user.password);
        const secret = serializeEncryptKey(encrypted);
        this.app.sheet.clear();
        this.app.sheet.append({
            title: 'New account created',
            component: new SheetNewAccountPhrase({app: this.app, wallet, secret})
        });
    }

}


class SheetNewAccountPhrase extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');

        // Name
        const name = new InputText({
            value: genWalletName(this.app.wallets.list, 'ICP'),
            placeholder: 'Wallet name'
        });
        this.append(name);

        // Info
        const info1 = document.createElement('p');
        info1.style.textAlign = 'center';
        info1.innerHTML = 'Your 12-words recovery phrase is the only way to recover your account if you lose access to your wallet.';
        this.element.append(info1);
        const info2 = document.createElement('p');
        info2.style.textAlign = 'center';
        info2.style.fontWeight = 'bold';
        info2.innerHTML = '&rarr; Write it down &rarr; Never share it &rarr; Do not lose it';
        this.element.append(info2);

        // Recovery pharse
        this.phrase = new RecoveryPhrase({
            number: 12,
            phrase: args.wallet.mnemonic,
            readonly: true
        });
        this.append(this.phrase);

        // Button
        this.append(new Button({
            text: 'Add to my wallets',
            click: async () => {
                this.app.wallets.list[args.wallet.public] = new ICPWallet({
                    blockchain: 'Internet Computer',
                    name: name.get(),
                    publicKey: args.wallet.public,
                    secret: args.secret
                });
                await this.app.wallets.list[args.wallet.public].rebuild(this.app.user.password);
                this.app.save('wallets', this.app.wallets.list);
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        }));
    }

}

