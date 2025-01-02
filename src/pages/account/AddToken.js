import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';
import { validICRC1 } from '/src/utils/Currency.js';
import { saveImage } from '/src/utils/ImageCache.js';
import { icpRebuildToken, icpBindTokenActions } from '/src/blockchain/InternetComputer/ICPWallet.js';

export class SheetAddCustomToken extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // UI controls widgets
        this.widget = {};

        // Token actor and metadata fetched from canister
        this.actor = null;
        this.metadata = null;

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
        this.widget.info.classList.add('preview');
        this.element.append(this.widget.info);

        // Button
        this.widget.submit = new Button({
            text: 'Verify',
            click: this.verifyAndAccept.bind(this)
        });
        this.append(this.widget.submit);

    }

    async verifyAndAccept() {

        this.widget.address.disable();

        // Token canister ID
        const canisterId = this.widget.address.get();

        // First pass (fetch actor+metadata & verify)
        if (!this.actor && !this.metadata) {
            this.widget.submit.busy(true);
            const info = await this.connectCanister(canisterId);
            this.widget.submit.busy(false);
            if (info.valid) {
                this.actor = info.actor;
                this.metadata = info.metadata;
                this.widget.info.innerHTML = '';
                if (('icrc1:logo' in this.metadata) && ('Text' in this.metadata['icrc1:logo'])) {
                    this.widget.info.innerHTML += `<img src="${this.metadata['icrc1:logo'].Text}" style="width: 80px; margin: 10px">`;
                }
                this.widget.info.style.height = '80px';
                this.widget.info.innerHTML += `<div style="font-size: 14px; font-weight: 500;">${this.metadata['icrc1:name'].Text} (${this.metadata['icrc1:symbol'].Text}) [${info.standard}]</div>`;
                this.widget.submit.set('Add to my wallet');
            }
            else {
                this.widget.address.enable();
                this.actor = null;
                this.metadata = null;
                alert('Unable to fetch or recognize token');
            }
        }

        // Second pass (accept)
        else {
            // Add token to wallet
            if (!(canisterId in this.wallet.tokens)) {
                icpRebuildToken({
                    actor: this.actor,
                    name: this.metadata['icrc1:name'].Text,
                    symbol: this.metadata['icrc1:symbol'].Text,
                    decimals: this.metadata['icrc1:decimals'].Nat,
                    fee: this.metadata['icrc1:fee'].Nat
                }, canisterId, this.wallet);
                icpBindTokenActions(this.wallet.tokens[canisterId], canisterId);
                if (('icrc1:logo' in this.metadata) && ('Text' in this.metadata['icrc1:logo'])) {
                    saveImage(`token:${canisterId}`, this.metadata['icrc1:logo'].Text);
                }
                this.app.save('wallets', this.app.user.wallets);
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
            else {
                this.widget.address.enable();
                this.actor = null;
                this.metadata = null;
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
            const data = await actor.metadata({});
            if (data) metadata = Object.fromEntries(data);
        }
        catch (error) {
            return { valid: false, error: 'Unable to connect canister' };
        }

        // Supported standards
        const standards = await actor.service.icrc10_supported_standards();
        const hasICRC1 = standards.some(item => item.name === 'ICRC-1');
        const hasICRC2 = standards.some(item => item.name === 'ICRC-2');

        // Validate
        if (hasICRC1 && validICRC1(metadata)) return {
            valid: true,
            standard: hasICRC2 ? 'ICRC-2' : 'ICRC-1',
            actor,
            metadata
        };

        return { valid: false, error: 'Not an ICRC-1 standard' };
    }

}

