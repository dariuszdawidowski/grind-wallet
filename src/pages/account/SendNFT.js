import { Principal } from '@dfinity/principal';
import { Component } from '/src/utils/Component.js';
import { Button, ButtonDescription } from '/src/widgets/Button.js';
import { InputAddress } from '/src/widgets/Input.js';

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

        this.widget.address = new InputAddress({
            placeholder: 'Principal ID'
        });
        this.append(this.widget.address);

        this.widget.submit = new Button({
            text: 'Send NFT',
            click: () => {
                // Not sent yet
                if (!this.sent) {
                    if (this.widget.address.valid()) this.transfer();
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
        this.append(this.widget.submit);

        // Description
        this.append(new ButtonDescription({
            app: args.app,
            text: `NFT charges a commission of <span id="fee">0</span>.`
        }));

    }

    transfer() {
    }

}

