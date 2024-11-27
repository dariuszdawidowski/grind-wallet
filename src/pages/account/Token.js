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
        this.fetched = false;

        // Button
        const submit = new Button({
            text: 'Proceed',
            click: () => {
                // First pass (fetch)
                if (!this.fetched) {
                    submit.busy(true);
                    this.fetchTokenMetadata(address.get()).then(metadata => {
                        submit.busy(false);
                        if (validICRC1(metadata)) {
                            info.innerHTML = '';
                            if (('icrc1:logo' in metadata) && ('Text' in metadata['icrc1:logo'])) info.innerHTML += `<img src="${metadata['icrc1:logo'].Text}" style="width: 80px; margin: 10px">`;
                            info.innerHTML += `<div style="font-size: 14px; font-weight: 500;">${metadata['icrc1:name'].Text} (${metadata['icrc1:symbol'].Text})</div>`;
                            submit.set('Accept');
                            this.fetched = true;
                        }
                        else {
                            alert('Unable to fetch token');
                        }
                    });
                }
                // Second pass (accept)
                else {
                    // Add token to wallet
                }
            }
        });
        this.append(submit);

    }

    async fetchTokenMetadata(canisterId) {
        let actor = null
        try {
            actor = IcrcLedgerCanister.create({
                agent: this.wallet.agent,
                canisterId,
            });
        }
        catch (error) {
            return {};
        }
        const data = await actor.metadata({});
        return Object.fromEntries(data);
    }

}

