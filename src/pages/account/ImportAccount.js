import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../Button.js';


export class CardImportAccount extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                This action will import the Internet Computer<br>
                blockchain account from the recovery phrase.
            </h3>
        `;

        // Buttons
        this.append(new Button({
            app,
            id: 'import-account-proceed',
            text: 'Proceed',
            click: () => {
            }
        }));

        // Description
        this.append(new ButtonDescription({
            app,
            text: 'If you enter an incorrect phrase, a new account will<br>be created based on it.'
        }));
    }

}
