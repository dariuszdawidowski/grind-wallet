import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Component } from '/src/utils/component.js';
import { formatCurrency, icpt2ICP, ICP2icpt } from '/src/utils/currency.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';
import { InputCurrency, InputAddress } from '/src/chrome-extension/popup/widgets/input.js';

export class SheetAccountSend extends Component {

    constructor({ app, wallet, canister }) {
        super({ app });

        // Token
        const token = wallet.tokens.get(canister.ledgerId);

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = wallet;

        // Canister ID
        this.canister = canister;

        // Sucessfuly sent
        this.sent = false;

        // Build
        this.element.classList.add('form');

        this.widget.amount = new InputCurrency({
            placeholder: formatCurrency(0, token.decimals),
            symbol: token.symbol
        });
        this.append(this.widget.amount);

        this.widget.address = new InputAddress({
            placeholder: this.canister.ledgerId === this.app.ICP_LEDGER_CANISTER_ID ? 'Principal ID or Account ID' : 'Principal ID'
        });
        this.append(this.widget.address);

        this.submit = new Button({
            text: 'Send',
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (!this.widget.amount.valid()) {
                        alert('Invalid amount');
                    }
                    else if (!this.widget.address.valid()) {
                        alert('Invalid address');
                    }
                    else {
                        this.transfer();
                    }
                }
                // Succesful sent
                else {
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        });
        this.append(this.submit);

        // Description
        this.append(new ButtonDescription({
            app: this.app,
            text: `Token charges a commission of <span id="fee">${token.fee ? icpt2ICP(token.fee, token.decimals) : 'unknown'}</span> ${token.symbol}.`
        }));

    }

    transfer() {

        // Principal ID
        let principal = null;

        // Account ID
        let account = null;

        // Allot transfer
        let allow = false;

        // Autodetect Principal ID
        if (this.widget.address.detect() == 'principal') {
            try {
                principal = Principal.fromText(this.widget.address.get());
                account = AccountIdentifier.fromPrincipal({ principal });
                allow = true;
            }
            catch(error) {
                alert('Invalid Principal ID');
            }
        }

        // Autodetect Account ID
        else {
            try {
                account = AccountIdentifier.fromHex(this.widget.address.get());
                allow = true;
            }
            catch(error) {
                alert('Invalid Account ID');
            }
        }

        // Send to byself
        if (principal === this.wallet.principal) {
            alert('You want to send to yourself');
            allow = false;
        }

        // Ok to transfer
        if (allow) {
            this.submit.busy(true);
            this.wallet.tokens.get(this.canister.ledgerId).transfer({
                principal,
                account,
                amount: this.widget.amount.get()
            }).then(result => {
                this.submit.busy(false);
                if ('OK' in result) {
                    // Log transaction
                    this.app.log.add({
                        type: 'send.token.begin',
                        pid: this.wallet.principal,
                        to: {
                            principal: principal.toText(),
                            account: account.toHex(),
                        },
                        token: {
                            canister: this.canister.ledgerId,
                            amount: Number(ICP2icpt(this.widget.amount.get()))
                        }
                    });
                    // Reset cache
                    this.app.timestamps.reset({ id: `history:*:${this.canister.ledgerId}` });
                    // Show success
                    this.submit.set('OK - successfully sent!');
                    this.sent = true;
                }
                else {
                    const errorMsg = 'Error' in result ? result.ERROR : 'Transfer error';
                    // Log error
                    this.app.log.add({
                        type: 'send.token.error',
                        pid: this.wallet.principal,
                        to: {
                            principal: principal.toText(),
                            account: account.toHex(),
                        },
                        token: {
                            canister: this.canister.ledgerId,
                            amount: Number(ICP2icpt(this.widget.amount.get()))
                        },
                        error: errorMsg
                    });
                    alert(errorMsg);
                }
            });
        }
    }

}

