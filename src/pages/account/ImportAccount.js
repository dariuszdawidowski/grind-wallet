import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../widgets/Button.js';
import { InputPhrase } from '../../widgets/Input.js';


export class SheetImportAccount extends Component {

    constructor(app) {
        super(app);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                This action will import the Internet Computer<br>
                blockchain account from the recovery phrase.
            </h3>
        `;

        // Inputs
        this.number = 12;
        this.inputs = [];
        for (let nr = 1; nr < this.number; nr ++) {
            const input = new InputPhrase({
                app,
                id: `phrase-${nr}`,
                nr
            });
            this.inputs.push(input);
            this.append(input);
        }

        // Button
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
