/**
 * Sending NFT form sheet
 */

import { Component } from '/src/utils/component.js';
import { Button, ButtonDescription } from '/src/extension/popup/widgets/button.js';
import { InputAddress } from '/src/extension/popup/widgets/input.js';
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

        // Address book
        this.app.drawer.clear();
        this.app.drawer.append(this.app.addressbook);
        if (!this.app.addressbook.isRendered()) this.app.addressbook.render();
        this.app.addressbook.callback = (contact) => {
            let result = ('icp:pid' in contact.address) ? contact.address['icp:pid'] : null;
            if (result) {
                method = 'byBook';
                this.widget.address.set({ impostor: contact.name, real: result });
                this.app.drawer.close();
            }
            else {
                alert('Invalid address. Expecting ICP Principal ID only.');
            }
        };

        // Address field
        let method = null;
        const acceptedAddresses = ['icp:pid'];
        this.widget.address = new InputAddress({
            placeholder: 'Principal ID',
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

        // Button send
        this.widget.submit = new Button({
            text: 'Send NFT',
            classList: ['bottom'],
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (!this.widget.address.valid()) {
                        alert('Invalid address');
                    }
                    else if (this.widget.address.get() === this.wallet.principal) {
                        alert('You are trying to send to yourself');
                    }
                    else {
                        this.transfer(this.widget.address.get());
                    }
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
        // Allot transfer
        let allow = false;

        if (this.widget.address.detect() == 'principal') {
            allow = true;
        }
        else {
            alert('Only Principal ID is supported for NFT transfers');
        }

        // Ok to transfer
        if (allow) {
            this.widget.submit.busy(true);
            this.nft.service.transfer({
                token: this.nft.id,
                to
            }).then(result => {
                this.widget.submit.busy(false);
                if ('OK' in result) {
                    // Log transaction
                    const datetime = new Date();
                    this.app.log.add(this.wallet.principal, `${this.nft.collection}:${datetime.getTime()}`, {
                        datetime: datetime.toISOString(),
                        type: 'send.nft.begin',
                        to: { principal: to },
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
                            wallet: toOwnWallet,
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
                    const errorMsg = ('Error' in result) ? result.ERROR : 'Transfer error';
                    // Log error
                    const datetime = new Date();
                    this.app.log.add(this.wallet.principal, `${this.nft.collection}:${datetime.getTime()}`, {
                        datetime: datetime.toISOString(),
                        type: 'send.nft.error',
                        to: { principal: to },
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

}

