/**
 * Sending NFT form sheet
 */

import { Component } from '/src/utils/component.js';
import { Button, ButtonDescription } from '/src/chrome-extension/popup/widgets/button.js';
import { InputAddress } from '/src/chrome-extension/popup/widgets/input.js';
import { NFT } from '/src/blockchain/nft.js';

export class SheetAccountSendNFT extends Component {

    constructor({ app, wallet, nft }) {
        super({ app });

        // UI controls widgets
        this.widget = {};
        
        // Wallet reference
        this.wallet = wallet;

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
            app: this.app,
            text: `Transferring NFTs is free.`
        }));

        // NFT info {collection, id, standard, thumbnail} 
        this.nft = nft;
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
                // Log transaction
                const datetime = new Date();
                this.app.log.add(this.wallet.principal, `${this.nft.collection}:${datetime.getTime()}`, {
                    datetime: datetime.toISOString(),
                    type: 'send.nft.begin',
                    to: to,
                    nft: {
                        canister: this.nft.collection,
                        id: this.nft.id
                    }
                });
                // Add to own wallet if exists
                const toOwnWallet = this.app.wallets.getByPrincipal(to);
                if (toOwnWallet) {
                    toOwnWallet.nfts.add(new NFT({
                        app: this.app,
                        principal: toOwnWallet.principal,
                        agent: toOwnWallet.agent,
                        collection: this.nft.collection,
                        id: this.nft.id,
                        thumbnail: this.nft.thumbnail,
                        standard: this.nft.standard
                    }));
                }
                // Remove from current wallet
                this.app.wallets.get(this.wallet.public)?.nfts.del(`${this.nft.collection}:${this.nft.id}`);
                // Save changes
                this.app.wallets.save();
                this.widget.submit.set('OK - successfully sent!');
                this.sent = true;
            }
            else {
                const errorMsg = 'Error' in result ? result.ERROR : 'Transfer error';
                // Log error
                const datetime = new Date();
                this.app.log.add(this.wallet.principal, `${this.nft.collection}:${datetime.getTime()}`, {
                    datetime: datetime.toISOString(),
                    type: 'send.nft.error',
                    to: to,
                    nft: {
                        canister: this.nft.collection,
                        id: this.nft.id
                    },
                    error: errorMsg
                });
                alert(errorMsg);
            }        
        });
    }

}

