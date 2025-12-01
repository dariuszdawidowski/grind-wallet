/**
 * Send ICP/token form
 */

import { Principal } from '@icp-sdk/core/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Component } from '/src/utils/component.js';
import { formatCurrency, icpt2ICP, ICP2icpt } from '/src/utils/currency.js';
import { Button, ButtonDescription } from '/src/extension/popup/widgets/button.js';
import { InputCurrency, InputAddress } from '/src/extension/popup/widgets/input.js';

export class SheetAccountSend extends Component {

    /**
     * Constructor
     * @param {App} args.app Application instance
     * @param {Wallet} args.wallet Wallet instance
     * @param {Canister} args.canister Canister instance
     */

    constructor(args) {
        super(args);

        // Token
        this.token = args.wallet.tokens.get(args.canister.ledgerId);

        // Token balance
        this.balance = null;
        this.token.balance().then(balance => {
            this.balance = balance;
        });

        // UI controls widgets
        this.widget = {};

        // Wallet reference
        this.wallet = args.wallet;

        // Canister ID
        this.canister = args.canister;

        // Sucessfuly sent
        this.sent = false;

        // Address book
        this.app.drawer.clear();
        this.app.drawer.append(this.app.addressbook);
        if (!this.app.addressbook.isRendered()) this.app.addressbook.render();
        this.app.addressbook.callback = (contact) => {
            let result = null;
            if (this.app.isICP(this.canister.ledgerId)) {
                result = ('icp:pid' in contact.address) ? contact.address['icp:pid'] : ('icp:acc0' in contact.address) ? contact.address['icp:acc0'] : null;
                if (!result) alert('Invalid address. Expecting ICP Principal ID or Account ID.');
            }
            else {
                result = ('icp:pid' in contact.address) ? contact.address['icp:pid'] : null;
                if (!result) alert('Invalid address. Expecting ICP Principal ID only.');
            }
            if (result) {
                method = 'byBook';
                this.widget.address.set({ impostor: contact.name, real: result });
                this.app.drawer.close();
            }
        };

        // Build
        this.element.classList.add('form');

        // Currency Input
        this.widget.amount = new InputCurrency({
            placeholder: formatCurrency(0, this.token.decimals),
            symbol: this.token.symbol
        });
        this.append(this.widget.amount);

        // Address
        let method = null;
        const acceptedAddresses = this.app.isICP(this.canister.ledgerId) ? ['icp:pid', 'icp:acc0'] : ['icp:pid'];
        this.widget.address = new InputAddress({
            placeholder: this.app.isICP(this.canister.ledgerId) ? 'Principal ID or Account ID' : 'Principal ID',
            icon: '<img src="assets/material-design-icons/account-box.svg">',
            onFocus: ({ value }) => {
                if (method == 'byAddress') this.widget.address.resetImpostor();
                else if (method == 'byBook') this.widget.address.realValue = null;
            },
            onBlur: ({ value }) => {
                let contact = this.app.addressbook.getByAddress(value);
                if (contact) {
                    method = 'byAddress';
                    this.widget.address.set({ impostor: contact.name });
                }
                else {
                    method = 'byName';
                    contact = this.app.addressbook.getByName(value);
                    if (contact) this.widget.address.set({ impostor: value, real: contact.getAddress(acceptedAddresses) });
                }
            },
            onIconClick: () => {
                this.app.drawer.toggle();
            },
            autocomplete: this.app.addressbook.getAllNames()
        });
        this.append(this.widget.address);

        // Send buton
        this.submit = new Button({
            text: 'Send',
            classList: ['bottom'],
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (!this.widget.amount.valid()) {
                        alert('Invalid amount');
                    }
                    else if (!this.widget.address.valid()) {
                        alert('Invalid address');
                    }
                    else if (this.balance === null) {
                        alert('Cannot fetch balance');
                    }
                    else if (ICP2icpt(this.widget.amount.get()) + BigInt(this.token.fee) > this.balance) {
                        alert('Insufficient balance');
                    }
                    else if (this.widget.address.get() === this.wallet.principal || this.widget.address.get() === this.wallet.account) {
                        alert('You are trying to send to yourself');
                    }
                    else {
                        this.transfer();
                    }
                }
                // Succesful sent
                else {
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        });
        this.append(this.submit);

        // Description
        this.append(new ButtonDescription({
            app: this.app,
            text: `Token charges a commission of <span id="fee">${this.token.fee ? icpt2ICP(this.token.fee, this.token.decimals) : 'unknown'}</span> ${this.token.symbol}.`
        }));

    }

    /**
     * Transfer token
     */

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
            // ICP
            if (this.app.isICP(this.canister.ledgerId)) {
                try {
                    account = AccountIdentifier.fromHex(this.widget.address.get());
                    allow = true;
                }
                catch(error) {
                    alert('Invalid Account ID');
                }
            }
            // ICRC
            else {
                alert('Only Principal ID allowed');
                allow = false;
            }
        }

        // Send to byself
        if (principal === this.wallet.principal) {
            alert('Destination address cannot be the same as sender address');
            allow = false;
        }

        // Ok to transfer
        if (allow) {
            this.submit.busy(true);
            this.token.transfer({
                principal,
                account,
                amount: this.widget.amount.get()
            }).then(result => {
                this.submit.busy(false);
                if ('OK' in result) {
                    // Calculate remaining balance and update
                    this.balance -= ICP2icpt(this.widget.amount.get()) + BigInt(this.token.fee);
                    this.app.cache.ram.set({ id: `balance.${this.wallet.account}.${this.canister.ledgerId}`, value: this.balance });
                    const tokenZeros = (this.canister.ledgerId === this.app.ICP_LEDGER_CANISTER_ID) ? 8 : 4;
                    const tokenBalance = document.querySelector(`#balance_${this.wallet.principal}_${this.token.symbol} .amount`);
                    if (tokenBalance) tokenBalance.innerText = formatCurrency(icpt2ICP(this.balance, this.token.decimals), tokenZeros);
                    // Sent to my own wallet?
                    const myownWallet = this.app.wallets.getByPrincipalOrAccount(principal?.toText(), account?.toHex());
                    if (myownWallet) {
                        const myownTokenBalance = document.querySelector(`#balance_${myownWallet.principal}_${this.token.symbol} .amount`);
                        if (myownTokenBalance) {
                            const balanceCurrent = Number(myownTokenBalance.innerText.replace(/,/g, ''));
                            const balanceAdd = Number(this.widget.amount.get());
                            myownTokenBalance.innerText = formatCurrency(balanceCurrent + balanceAdd, tokenZeros);
                        }
                    }
                    // Log transaction
                    const datetime = new Date();
                    this.app.log.add(this.wallet.principal, `${this.canister.ledgerId}:${datetime.getTime()}`, {
                        datetime: datetime.toISOString(),
                        type: 'send.token.begin',
                        to: {
                            principal: principal?.toText(),
                            account: account?.toHex(),
                        },
                        token: {
                            canister: this.canister.ledgerId,
                            amount: Number(ICP2icpt(this.widget.amount.get())),
                            fee: this.token.fee
                        }
                    });
                    // Reset history logger cache
                    this.app.cache.info.reset({ id: `history:*:${this.canister.ledgerId}` });
                    // Show success
                    this.submit.set('OK - successfully sent!');
                    this.sent = true;
                }
                else {
                    const errorMsg = ('Error' in result) ? result.ERROR : 'Transfer error';
                    // Log error
                    const datetime = new Date();
                    this.app.log.add(this.wallet.principal, `${this.canister.ledgerId}:${datetime.getTime()}`, {
                        datetime: datetime.toISOString(),
                        type: 'send.token.error',
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

