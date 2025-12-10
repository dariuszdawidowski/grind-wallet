/**
 * Reveal seed phrase sheet
 */

import { browser } from '/src/utils/browser.js';
import { Component } from '/src/utils/component.js';
import { Button } from '/src/extension/popup/widgets/button.js';
import { InputPassword, RecoveryPhrase } from '/src/extension/popup/widgets/input.js';
import { Copy } from '/src/extension/popup/widgets/copy.js';
import { decryptKey, deserializeEncryptKey } from '/src/utils/keys.js';

export class SheetRevealPhrase extends Component {

    constructor({ app, wallet }) {
        super({ app });

        // References
        this.wallet = wallet;

        // Build
        this.element.classList.add('form');

        if ('mnemonic' in this.wallet.secret) {
            browser.storage.local.get(['salt', 'password']).then((storageLocal) => {
                if (storageLocal.salt && storageLocal.password) {
                    this.unlockRevealPhrase(storageLocal.salt, storageLocal.password);
                }
            });
        }
        else {
            const warning = document.createElement('p');
            warning.textContent = 'It appears that this wallet was created in the old version of Grind Wallet (below v0.6.4) and does not have a seed phrase saved with it.';
            this.element.append(warning);
        }

    }

    /**
     * Unlock reveal phrase by password
     * @param {string} salt 
     * @param {string} hash
     */

    unlockRevealPhrase(salt, hash) {

        // Header
        const header = document.createElement('h2');
        header.textContent = 'Please enter your password to reveal your seed phrase.';
        this.element.append(header);

        // Inputs
        const password = new InputPassword({
            placeholder: 'Password',
            focus: true
        });
        this.append(password);

        // Buttons
        const button = new Button({
            text: 'Unlock',
            style: 'margin-top: 20px; margin-bottom: 20px;',
            enter: false,
            click: () => {
                const passwordValue = password.get();
                this.app.session.verifyPassword(passwordValue, salt, hash).then((valid) => {
                    if (valid) {
                        this.revealPhrase(passwordValue);
                    }
                    else {
                        password.set('');
                        password.input.placeholder = 'Password';
                        button.enable();
                        alert('Incorrect password. Please try again.');
                    }
                });
                password.set('');
                password.input.placeholder = 'Password sent';
                button.disable();
            }
        });
        this.append(button);
    }

    /**
     * Decode and reveal seed phrase
     */

    async revealPhrase(password) {
        const deserialized = deserializeEncryptKey(this.wallet.secret.mnemonic);
        const mnemonic = await decryptKey(deserialized, password);

        // Clear element
        this.element.innerHTML = '';

        // Header
        const header = document.createElement('h2');
        header.textContent = 'Your seed phrase:';
        this.element.append(header);

        // Display recovery pharse
        this.phrase = new RecoveryPhrase({
            style: 'margin-bottom: 10px;',
            number: 12,
            phrase: mnemonic,
            readonly: true
        });
        this.append(this.phrase);

        // Copy to clipboard
        this.append(new Copy({
            style: 'margin: 10px auto;',
            text: 'Copy to clipboard',
            buffer: mnemonic
        }));

    }

}

