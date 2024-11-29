import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Component } from '/src/utils/Component.js';
// import { formatE8S } from '/src/utils/Currency.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
// import { SheetAccountSend } from './Send.js';
// import { SheetAccountReceive } from './Receive.js';
import { validICRC1 } from '/src/utils/Currency.js';


export class SheetAddCustomToken extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Enter the canister id of the Internet Computer<br>
                blockchain custom token.
            </h3>
        `;

        // Address field
        const address = new InputAddress({
            placeholder: 'Canister ID'
        });
        this.append(address);

        // Token info pocket
        const info = document.createElement('div');
        info.style.display = 'flex';
        info.style.flexDirection = 'column';
        info.style.justifyContent = 'center';
        info.style.alignItems = 'center';
        info.style.margin = '0 0 20px 0';
        this.element.append(info);

        // Token metadata fetched
        this.token = null;

        // Button
        const submit = new Button({
            text: 'Proceed',
            click: () => {

                // Token canister ID
                address.disable();
                const canisterId = address.get();

                // First pass (fetch)
                if (!this.token) {
                    submit.busy(true);
                    this.fetchToken(canisterId).then(() => {
                        submit.busy(false);
                        if (validICRC1(this.token.metadata)) {
                            info.innerHTML = '';
                            if (('icrc1:logo' in this.token.metadata) && ('Text' in this.token.metadata['icrc1:logo'])) {
                                info.innerHTML += `<img src="${this.token.metadata['icrc1:logo'].Text}" style="width: 80px; margin: 10px">`;
                            }
                            info.innerHTML += `<div style="font-size: 14px; font-weight: 500;">${this.token.metadata['icrc1:name'].Text} (${this.token.metadata['icrc1:symbol'].Text})</div>`;
                            submit.set('Accept');
                        }
                        else {
                            address.enable();
                            this.token = null;
                            alert('Unable to fetch token');
                        }
                    });
                }

                // Second pass (accept)
                else {
                    // Add token to wallet
                    if (!(canisterId in this.wallet.tokens)) {
                        this.wallet.tokens[canisterId] = {
                            actor: this.token.actor,
                            balance: null,
                            name: this.token.metadata['icrc1:name'].Text,
                            symbol: this.token.metadata['icrc1:symbol'].Text,
                            decimals: this.token.metadata['icrc1:decimals'].Nat,
                            fee: this.token.metadata['icrc1:fee'].Nat
                        };
                        this.app.save('wallets', this.app.user.wallets);
                        this.app.sheet.clear();
                        this.app.sheet.hide();
                    }
                    else {
                        address.enable();
                        this.token = null;
                        alert('Token already on the list');
                    }
                }
            }
        });
        this.append(submit);

    }

    async fetchToken(canisterId) {
        let actor = null
        try {
            actor = IcrcLedgerCanister.create({
                agent: this.wallet.agent,
                canisterId,
            });
        }
        catch (error) {
            this.token = { actor: null, metadata: {} };
        }
        const data = await actor.metadata({});
        this.token = { actor, metadata: Object.fromEntries(data) };
    }

}

