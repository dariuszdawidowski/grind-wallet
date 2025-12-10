import { Component } from '/src/utils/component.js';
import { Button } from '/src/extension/popup/widgets/button.js';
import { Copy } from '/src/extension/popup/widgets/copy.js';
import { InputText, RecoveryPhrase } from '/src/extension/popup/widgets/input.js';
import { keysRecoverFromPhraseSecp256k1, encryptKey, serializeEncryptKey } from '/src/utils/keys.js';
import { ICPWallet } from '/src/blockchain/InternetComputer/wallet-icp.js';

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
        const password = await this.app.session.getPassword();
        const encryptedPrivate = await encryptKey(wallet.private, password);
        const encryptedMnemonic = await encryptKey(wallet.mnemonic, password);
        const secret = {
            ...serializeEncryptKey(encryptedPrivate),
            mnemonic: serializeEncryptKey(encryptedMnemonic)
        };
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
            value: this.app.wallets.genNextWalletName('ICP'),
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

        console.log('men', args.wallet.mnemonic)

        // Copy to clipboard
        this.append(new Copy({
            style: 'margin: 0 auto;',
            text: 'Copy to clipboard',
            buffer: args.wallet.mnemonic
        }));

        // Button
        const addWallet = new Button({
            text: 'Add to my wallets',
            classList: ['bottom'],
            click: async () => {
                addWallet.busy(true);
                const newWallet = new ICPWallet({
                    app: this.app,
                    blockchain: 'Internet Computer',
                    name: name.get(),
                    publicKey: args.wallet.public,
                    secret: args.secret
                });
                const password = await this.app.session.getPassword();
                await newWallet.build(password);
                await this.app.wallets.add(newWallet, password);
                this.app.wallets.save();
                await this.app.log.reinit('Logs', this.app.wallets.get().map(wallet => wallet.principal));
                addWallet.busy(false);
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
        });
        this.append(addWallet);
    }

}

