/**
 * Register Custom Token Sheet
 */

import { Component } from '/src/utils/component.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';
import { InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { ICRCToken } from '/src/blockchain/InternetComputer/token-icrc.js';
import { isValidCanisterId, ONE_WEEK } from '/src/utils/general.js';
import { saveImage } from '/src/utils/image-cache.js';

export class SheetAddCustomToken extends Component {

    constructor({ app, wallet }) {
        super({ app });

        // Wallet reference
        this.wallet = wallet;

        // UI controls widgets
        this.widget = {};

        // Verify stage passed
        this.verified = false;

        // New token instance
        this.token = null;

        // Token metadata
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

        // Disable inputs
        this.widget.address.disable();
        this.widget.index.disable();

        // Validate token canister ID
        const ledgerCanisterId = this.widget.address.get();
        if (!isValidCanisterId(ledgerCanisterId)) {
            alert('Invalid Token Canister ID');
            this.widget.address.enable();
            this.widget.index.enable();
            return;
        }

        // Validate index canister ID (if provided)
        const indexCanisterId = this.widget.index.get();
        if (indexCanisterId.length && !isValidCanisterId(indexCanisterId)) {
            alert('Invalid Index Canister ID');
            this.widget.address.enable();
            this.widget.index.enable();
            return;
        }

        // Create but not build token yet
        if (!this.wallet.tokens.get(ledgerCanisterId)) {

            // First pass (fetch actor+metadata & verify)
            if (!this.verified) {
                this.widget.submit.busy(true);
                this.token = new ICRCToken({
                    app: this.app,
                    wallet: { principal: this.wallet.principal, account: this.wallet.account },
                    canisterId: ledgerCanisterId
                });
                this.token.build({ agent: this.wallet.agent });
                this.metadata = await this.token.metadata();
                this.verified = this.token.valid;
                if (this.verified) {
                    // Found index
                    if (this.metadata.index_principal) this.widget.index.set(this.metadata.index_principal.Text);
                    // Logo
                    if (('logo' in this.metadata) && ('Text' in this.metadata['logo'])) {
                        this.widget.preview.innerHTML = `<img src="${this.metadata['logo'].Text}" style="width: 80px; margin: 10px">`;
                    }
                    // Info
                    this.widget.info.innerHTML = `${this.metadata['name'].Text} (${this.metadata['symbol'].Text})${this.metadata['standards'].includes('ICRC-2') ? ' [ICRC-2]' : ' [ICRC-1]'}`;
                    // Prepare to accept
                    this.widget.submit.set('Add to my wallet');
                }
                else {
                    this.widget.address.enable();
                    this.widget.index.enable();
                    this.token = null;
                    this.metadata = null;
                    alert('Unable to fetch or recognize token');
                }
                this.widget.submit.busy(false);
            }

            // Second pass (accept)
            else {
                // Add token to wallet
                this.wallet.tokens.add(this.token);
                // Save logo image
                if (('logo' in this.metadata) && ('Text' in this.metadata['logo'])) {
                    saveImage(`token:${this.token.canister.ledgerId}`, this.metadata['logo'].Text);
                }
                // Refresh token info in weekly basis
                this.app.timestamps.expired({ id: `token:${this.token.canister.ledgerId}`, overdue: ONE_WEEK })
                // Save wallets
                this.app.wallets.save();
                // Back to accounts page
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();

            }
        }
        else {
            alert('Token already on the list');
            this.widget.address.enable();
            this.widget.index.enable();
        }

    }

}

