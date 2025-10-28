/**
 * Register Custom Token Sheet
 */

import { Actor } from '@dfinity/agent';
import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { ICRCToken } from '/src/blockchain/InternetComputer/token-icrc.js';
import { idlFactory as idlICRCIndex } from '/src/blockchain/InternetComputer/candid/icrc-index.did.js';
import { validICRC1 } from '/src/utils/currency.js';
import { isValidCanisterId } from '/src/utils/general.js';
import { saveImage } from '/src/utils/image-cache.js';

export class SheetAddCustomToken extends Component {

    constructor({ app, wallet }) {
        super({ app });

        // Wallet reference
        this.wallet = wallet;

        // UI controls widgets
        this.widget = {};

        // Token canister ID
        this.canister = {
            ledgerId: null,
            indexId: null
        };

        // Token actors
        this.actor = {
            ledger: null,
            index: null
        };

        // Token metadata fetched from canister
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

        // Ledger canister id field
        this.widget.address = new InputAddress({
            placeholder: 'Token Canister ID'
        });
        this.append(this.widget.address);

        // Index canister id field
        this.widget.index = new InputAddress({
            placeholder: 'Index Canister ID (optional)'
        });
        this.widget.index.element.style.marginTop = '0px';
        this.append(this.widget.index);

        // Token info pocket
        this.widget.preview = document.createElement('div');
        this.widget.preview.classList.add('preview-token');
        this.element.append(this.widget.preview);
        this.widget.info = document.createElement('div');
        this.widget.info.classList.add('info-token');
        this.element.append(this.widget.info);

        // Button
        this.widget.submit = new Button({
            text: 'Verify',
            click: this.verifyAndAccept.bind(this)
        });
        this.append(this.widget.submit);

    }

    /**
     * Verify token canister and accept to wallet
     */

    async verifyAndAccept() {

        this.widget.address.disable();

        // Token canister ID
        const canisterId = this.widget.address.get();

        // Validate token canister ID
        if (!isValidCanisterId(canisterId)) {
            alert('Invalid Token Canister ID');
            this.widget.address.enable();
            return;
        }

        // Validate index canister ID (if provided)
        const indexCanisterId = this.widget.index.get();
        if (indexCanisterId.length && !isValidCanisterId(indexCanisterId)) {
            alert('Invalid Index Canister ID');
            this.widget.index.enable();
            return;
        }

        // First pass (fetch actor+metadata & verify)
        if (!this.actor.ledger && !this.metadata) {
            await this.verifyLedgerCanister(canisterId);
            if (indexCanisterId.length) await this.verifyIndexCanister(indexCanisterId);
        }

        // Second pass (accept)
        else {
            this.addTokenToWallet(canisterId);
        }
    }

    /**
     * Verify the ledger canister
     */

    async verifyLedgerCanister(canisterId) {
        this.widget.submit.busy(true);
        const info = await this.connectLedgerCanister(canisterId);
        this.widget.submit.busy(false);
        if (info.valid) {
            this.canister.ledgerId = canisterId;
            this.actor.ledger = info.actor;
            this.metadata = info.metadata;
            if (('icrc1:logo' in this.metadata) && ('Text' in this.metadata['icrc1:logo'])) {
                this.widget.preview.innerHTML = `<img src="${this.metadata['icrc1:logo'].Text}" style="width: 80px; margin: 10px">`;
            }
            this.widget.info.innerHTML = `${this.metadata['icrc1:name'].Text} (${this.metadata['icrc1:symbol'].Text})${info.standard ? ` [${info.standard}]` : ''}`;
            this.widget.submit.set('Add to my wallet');
        }
        else {
            this.widget.address.enable();
            this.widget.index.enable();
            this.actor.ledger = null;
            this.metadata = null;
            alert('Unable to fetch or recognize token');
        }
    }

    /**
     * Verify the ledger canister
     */

    async connectLedgerCanister(canisterId) {
        let actor = null
        let metadata = null;
        let standard = null;

        // Try ICRC-1 ledger standard
        try {
            actor = IcrcLedgerCanister.create({
                agent: this.wallet.agent,
                canisterId,
            });
            const data = await actor.metadata({});
            if (data) metadata = Object.fromEntries(data);
            standard = 'ICRC-1/2';
        }
        catch (error) {
            return { valid: false, error: 'Unable to connect token canister' };
        }

        // Supported standards
        try {
            const standards = await actor.service.icrc10_supported_standards();
            const hasICRC1 = standards.some(item => item.name === 'ICRC-1');
            const hasICRC2 = standards.some(item => item.name === 'ICRC-2');
            standard = hasICRC2 ? 'ICRC-2' : hasICRC1 ? 'ICRC-1' : null;
        }
        catch (_) {}

        // Validate
        if (validICRC1(metadata)) return {
            valid: true,
            standard,
            actor,
            metadata
        };

        return { valid: false, error: 'Not an ICRC-1 standard' };
    }

    /**
     * Verify the index canister
     */

    async verifyIndexCanister(canisterId) {
        this.widget.submit.busy(true);
        const info = await this.connectIndexCanister(canisterId);
        this.widget.submit.busy(false);
        if (info.valid) {
            this.canister.indexId = canisterId;
            this.actor.index = info.actor;
        }
        else {
            this.widget.address.enable();
            this.widget.address.enable();
            this.widget.index.enable();
            this.actor.ledger = null;
            this.actor.index = null;
            this.metadata = null;
            this.widget.submit.set('Verify');
            alert('Unable to fetch or recognize index canister');
        }
    }

    /**
     * Verify the index canister
     */

    async connectIndexCanister(canisterId) {
        let actor = null
        let status = null;

        // Try ICRC-1 index standard
        try {
            actor = Actor.createActor(idlICRCIndex, { agent: this.wallet.agent, canisterId })
            status = await actor.status();
        }
        catch (error) {
            return { valid: false, error: 'Unable to connect index canister' };
        }

        // Validate
        if (actor && status && ('num_blocks_synced' in status)) {
            return {
                valid: true,
                actor
            };
        }

        return { valid: false, error: 'Not an ICRC-INDEX standard' };
    }

    /**
     * Add token to wallet
     */

    addTokenToWallet(canisterId) {
        if (!this.wallet.tokens.get(canisterId)) {
            const data = {
                app: this.app,
                wallet: { principal: this.wallet.principal, account: this.wallet.account },
                canisterId: this.canister.ledgerId,
                name: this.metadata['icrc1:name'].Text,
                symbol: this.metadata['icrc1:symbol'].Text,
                decimals: Number(this.metadata['icrc1:decimals'].Nat),
                fee: Number(this.metadata['icrc1:fee'].Nat)
            };
            if (this.actor.index) data['indexId'] = this.canister.indexId;
            const newToken = new ICRCToken(data);
            newToken.build({ agent: this.wallet.agent });
            this.wallet.tokens.add(newToken);
            if (('icrc1:logo' in this.metadata) && ('Text' in this.metadata['icrc1:logo'])) {
                saveImage(`token:${canisterId}`, this.metadata['icrc1:logo'].Text);
            }
            this.app.wallets.save();
            this.app.page('accounts');
            this.app.sheet.clear();
            this.app.sheet.hide();
        }
        else {
            this.widget.address.enable();
            this.actor.ledger = null;
            this.actor.index = null;
            this.metadata = null;
            alert('Token already on the list');
        }

    }

}

