import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
import { validICRC1 } from '/src/utils/Currency.js';
import { saveImage } from '/src/utils/ImageCache.js';
import { icpRebuildToken, icpBindTokenActions } from '/src/blockchain/InternetComputer/Wallet.js';

export class SheetAddCustomToken extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // UI controls widgets
        this.widget = {};

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Enter the <b>Canister ID</b><br>
                of the Internet Computer blockchain custom token.
            </h3>
            <h3>Accepted standards: <b>ICRC-1</b>/<b>2</b></h3>
        `;

        // Address field
        this.widget.address = new InputAddress({
            placeholder: 'Canister ID'
        });
        this.append(this.widget.address);

        // Token info pocket
        this.widget.info = document.createElement('div');
        this.widget.info.style.display = 'flex';
        this.widget.info.style.flexDirection = 'column';
        this.widget.info.style.justifyContent = 'center';
        this.widget.info.style.alignItems = 'center';
        this.widget.info.style.margin = '0 0 20px 0';
        this.element.append(this.widget.info);

        // Button
        this.widget.submit = new Button({
            text: 'Verify',
            click: this.verifyAndAccept.bind(this)
        });
        this.append(this.widget.submit);

    }

    async verifyAndAccept() {

        // Token actor and metadata fetched from canister
        const actor = null;
        const metadata = null;

        // Token canister ID
        this.widget.address.disable();
        const canisterId = this.widget.address.get();

        // First pass (fetch actor+metadata & verify)
        if (!actor && !metadata) {
            this.widget.submit.busy(true);
            this.connectCanister(canisterId).then((info) => {
                this.widget.submit.busy(false);
                if (info.valid) {
                    this.widget.info.innerHTML = '';
                    if (('icrc1:logo' in metadata) && ('Text' in metadata['icrc1:logo'])) {
                        this.widget.info.innerHTML += `<img src="${metadata['icrc1:logo'].Text}" style="width: 80px; margin: 10px">`;
                    }
                    this.widget.info.innerHTML += `<div style="font-size: 14px; font-weight: 500;">${metadata['icrc1:name'].Text} (${metadata['icrc1:symbol'].Text})</div>`;
                    this.widget.submit.set('Add to my wallet');
                }
                else {
                    this.widget.address.enable();
                    actor = null;
                    metadata = null;
                    alert('Unable to fetch or reckognize token');
                }
            });
        }

        // Second pass (accept)
        else {
            // Add token to wallet
            if (!(canisterId in this.wallet.tokens)) {
                icpRebuildToken({
                    actor,
                    name: metadata['icrc1:name'].Text,
                    symbol: metadata['icrc1:symbol'].Text,
                    decimals: metadata['icrc1:decimals'].Nat,
                    fee: metadata['icrc1:fee'].Nat
                }, canisterId, this.wallet);
                icpBindTokenActions(this.wallet.tokens[canisterId], canisterId);
                if (('icrc1:logo' in metadata) && ('Text' in metadata['icrc1:logo'])) {
                    saveImage(`token:${canisterId}`, metadata['icrc1:logo'].Text);
                }
                this.app.save('wallets', this.app.user.wallets);
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
            else {
                this.widget.address.enable();
                actor = null;
                metadata = null;
                alert('Token already on the list');
            }
        }
    }

    async connectCanister(canisterId) {
        let actor = null
        let metadata = null;

        // Try ICRC-1 ledger standard
        try {
            actor = IcrcLedgerCanister.create({
                agent: this.wallet.agent,
                canisterId,
            });
            metadata = await actor.metadata({});
        }
        catch (error) {
            return { valid: false, error: 'Unable to connect canister' };
        }

        // Validate
        if (!validICRC1(metadata)) return { valid: false, error: 'Not an ICRC-1 standard' };

        // OK
        return {
            valid: true,
            standard: 'ICRC-1',
            actor,
            metadata: Object.fromEntries(metadata)
        };
    }

}

