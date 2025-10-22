import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Component } from '/src/utils/Component.js';
import { formatCurrency, icpt2ICP } from '/src/utils/Currency.js';
import { Button, ButtonDescription } from '/src/widgets/button.js';
import { InputCurrency, InputAddress } from '/src/widgets/input.js';
import { ICP2icpt } from '/src/utils/Currency.js';

export class SheetAccountSend extends Component {

    constructor(args) {
        super(args);

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = args.wallet;

        // Canister ID
        this.canisterId = args.canisterId;

        // Sucessfuly sent
        this.sent = false;

        // Build
        this.element.classList.add('form');

        this.widget.amount = new InputCurrency({
            placeholder: formatCurrency(0, this.wallet.tokens[this.canisterId].decimals),
            symbol: this.wallet.tokens[this.canisterId].symbol
        });
        this.append(this.widget.amount);

        this.widget.address = new InputAddress({
            placeholder: this.canisterId == this.app.ICP_LEDGER_CANISTER_ID ? 'Principal ID or Account ID' : 'Principal ID'
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
            app: args.app,
            text: `Token charges a commission of <span id="fee">${this.wallet.tokens[this.canisterId].fee ? icpt2ICP(this.wallet.tokens[this.canisterId].fee, this.wallet.tokens[this.canisterId].decimals) : 'unknown'}</span> ${this.wallet.tokens[this.canisterId].symbol}.`
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
        if (principal == this.wallet.principal) {
            alert('You want to send to yourself');
            allow = false;
        }

        // Ok to transfer
        if (allow) {
            this.submit.busy(true);
            this.wallet.tokens[this.canisterId].request.transfer({
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
                            canister: this.canisterId,
                            amount: Number(ICP2icpt(this.widget.amount.get()))
                        }
                    });
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
                            canister: this.canisterId,
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

