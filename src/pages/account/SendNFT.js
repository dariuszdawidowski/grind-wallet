import { Principal } from '@dfinity/principal';
import { Component } from '/src/utils/Component.js';
import { Button, ButtonDescription } from '/src/widgets/button.js';
import { InputAddress } from '/src/widgets/input.js';

export class SheetAccountSendNFT extends Component {

    constructor(args) {
        super(args);

        // UI controls widgets
        this.widget = {};
        
        // Wallet reference
        this.wallet = args.wallet;

        // Sucessfuly sent
        this.sent = false;

        // Build
        this.element.classList.add('form');

        // Address field
        this.widget.address = new InputAddress({
            placeholder: 'Principal ID'
        });
        this.append(this.widget.address);

        // Button send
        this.widget.submit = new Button({
            text: 'Send NFT',
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (this.widget.address.valid()) this.transfer(this.widget.address.get());
                    else alert('Invalid address');
                }
                // Succesful sent
                else {
                    this.app.page('accounts');
                    this.app.sheet.clear();
                    this.app.sheet.hide();
                }
            }
        });
        this.widget.submit.disable();
        this.append(this.widget.submit);

        // Description
        this.append(new ButtonDescription({
            app: args.app,
            text: `Transferring NFTs is free.`
        }));

        // NFT info {collection, id, standard, thumbnail} 
        this.nft = args.nft;
        this.nft.cache().then(() => {
            this.widget.submit.enable();
        });

    }

    /**
     * Transfer NFT to other account
     */

    transfer(to) {
        this.widget.submit.busy(true);
        this.nft.service.transfer({
            token: this.nft.id,
            to
        }).then(result => {
            this.widget.submit.busy(false);
            if (result === true) {
                // Add to own wallet if exists
                const toOwnWallet = this.app.wallets.getByPrincipal(to);
                if (toOwnWallet) {
                    toOwnWallet.nfts[this.nft.id] = new NFT({
                        principal: toOwnWallet.principal,
                        agent: toOwnWallet.agent,
                        collection: this.nft.collection,
                        id: this.nft.id,
                        thumbnail: `nft:${this.nft.id}`,
                        standard: this.nft.standard
                    });
                }
                // Remove from current wallet
                delete this.app.wallets.get(this.wallet.public)?.nfts[`${this.nft.collection}:${this.nft.id}`];
                // Save changes
                this.app.saveWallets();
                this.sent = true;
                this.widget.submit.set('OK');
            }
            else {
                alert('Transfer error');
            }        
        });
    }

}

