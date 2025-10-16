import { Actor } from '@dfinity/agent';
import { Component } from '/src/utils/Component.js';
import { Button } from '/src/widgets/button.js';
import { InputAddress } from '/src/widgets/input.js';
import { saveImage } from '/src/utils/ImageCache.js';
import { idlFactory as idlFactoryEXT } from '/src/blockchain/InternetComputer/candid/NFT_EXT.did.js';
import { NFT_EXT } from '/src/blockchain/InternetComputer/NFT_EXT.js';
import { idlFactory as idlFactoryICRC37 } from '/src/blockchain/InternetComputer/candid/NFT_ICRC37.did.js';
import { NFT_ICRC7 } from '/src/blockchain/InternetComputer/NFT_ICRC7.js';
import { NFT } from '/src/blockchain/NFT.js';
import { isValidCanisterId } from '/src/utils/General.js';

export class SheetAddCustomNFT extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // UI controls widgets
        this.widget = {};

        // Token actor and metadata fetched from canister
        this.actor = null;
        this.nft = null;

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                Enter the <b>Canister ID</b> and <b>Token ID</b><br>
                of the Internet Computer blockchain NFT.
            </h3>
            <h3>Accepted standards: <b>ICRC-7</b>/<b>37</b>, <b>EXT</b></h3>
        `;

        // Address field
        this.widget.address = new InputAddress({
            placeholder: 'Canister ID (Collection)'
        });
        this.append(this.widget.address);

        // NFT id field
        this.widget.token = new InputAddress({
            placeholder: 'NFT ID (Token)'
        });
        this.widget.token.element.style.marginTop = '0';
        this.append(this.widget.token);

        // NFT info pocket
        this.widget.preview = document.createElement('div');
        this.widget.preview.classList.add('preview-nft');
        this.element.append(this.widget.preview);
        this.widget.info = document.createElement('div');
        this.widget.info.classList.add('info-nft');
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
        this.widget.token.disable();

        // NFT canister ID and token ID
        const canisterId = this.widget.address.get();
        const tokenId = this.widget.token.get();

        // Validate inputs
        if (!isValidCanisterId(canisterId)) {
            alert('Invalid canister ID');
            this.widget.address.enable();
            this.widget.token.enable();
            return;
        }
        if (tokenId == '') {
            alert('Invalid token ID');
            this.widget.address.enable();
            this.widget.token.enable();
            return;
        }

        // First pass (fetch actor+metadata & verify)
        if (!this.actor) {
            this.widget.submit.busy(true);
            const info = await this.connectCanister(canisterId);
            if (info.valid) {
                this.actor = info.actor;
                this.standard = info.standard;
                if (this.standard == 'ICRC-7') this.nft = new NFT_ICRC7({ agent: this.wallet.agent, collection: canisterId });
                else if (this.standard == 'EXT') this.nft = new NFT_EXT({ agent: this.wallet.agent, actor: this.actor, collection: canisterId });
                // Display preview
                const thumb = await this.nft.getThumbnail({ token: tokenId });
                this.widget.preview.innerHTML = thumb;
                this.widget.preview.style.height = '80px';
                this.widget.info.innerHTML = `${info.collection.name ? info.collection.name : ''}${info.collection.symbol ? ` (${info.collection.symbol})` : ''}${info.standard ? ` [${info.standard}]` : ''}`;
                // Check ownership
                const own = await this.nft.isOwner({ token: tokenId });
                if (own) {
                    this.widget.submit.set('Add to my wallet');
                }
                else  {
                    this.actor = null;
                    this.widget.submit.set('You do not own this NFT');
                    this.widget.submit.disable();
                }
            }
            else {
                this.widget.address.enable();
                this.widget.token.enable();
                this.actor = null;
                alert('Unable to fetch or recognize NFT');
            }
            this.widget.submit.busy(false);
        }

        // Second pass (accept)
        else {
            // Add NFT to the wallet
            const nftId = `${canisterId}:${tokenId}`;
            if (!(nftId in this.wallet.nfts)) {
                // Log transaction
                this.app.log.add({
                    type: 'add.nft',
                    pid: this.wallet.principal,
                    nft: {
                        canister: canisterId,
                        id: tokenId
                    }
                });
                // Cache image and save
                const img = await this.nft.getImage({ token: tokenId });
                await saveImage(`nft:${nftId}`, img);
                // Add to wallet
                this.wallet.nfts[nftId] = new NFT({
                    principal: this.wallet.principal,
                    agent: this.wallet.agent,
                    collection: canisterId,
                    id: tokenId,
                    thumbnail: `nft:${nftId}`,
                    standard: this.standard
                });
                // Save wallets
                this.app.saveWallets();
                this.app.page('accounts');
                this.app.sheet.clear();
                this.app.sheet.hide();
            }
            else {
                this.widget.address.enable();
                this.widget.token.enable();
                this.actor = null;
                alert('NFT already on the list');
            }
        }

    }

    /**
     * Connect to canister and detect standard
     * @param {string} canisterId 
     * @returns { valid: bool, standard: string, actor: Actor, metadata: object }
     */

    async connectCanister(canisterId) {
        let actor = null
        let standard = null;
        let valid = false;
        let collection = {
            name: null,
            symbol: null
        }

        // Try ICRC-7 standard
        try {
            actor = Actor.createActor(idlFactoryICRC37, {
                agent: this.wallet.agent,
                canisterId,
            });
            const standards = await actor.icrc10_supported_standards();
            const name = await actor.icrc7_name();
            const symbol = await actor.icrc7_symbol();
            if (Array.isArray(standards) && standards.some(std => std.name === 'ICRC-7')) {
                collection = { name, symbol };
                return { valid: true, standard: 'ICRC-7', actor, collection };
            }
        }
        catch (_) {
            actor = null;
        }

        // Try EXT standard
        try {
            actor = Actor.createActor(idlFactoryEXT, {
                agent: this.wallet.agent,
                canisterId,
            });
            const standards = await actor.extensions();
            if (Array.isArray(standards) && standards.includes('@ext/nonfungible')) {
                return { valid: true, standard: 'EXT', actor, collection };
            }
        }
        catch (_) {
            actor = null;
        }

        // OK
        return { valid, standard, actor, collection };
    }

}

