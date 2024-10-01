import { Component } from '../../Boost.js';
import { Button, ButtonDescription } from '../../widgets/Button.js';


export class SheetNewAccount extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = `
            <h3>
                This action will create a new free account<br>
                for the Internet Computer blockchain.
            </h3>
        `;

        // Buttons
        this.append(new Button({
            app,
            id: 'create-account-proceed',
            text: 'Proceed',
            click: () => {
            }
        }));

        // Description
        this.append(new ButtonDescription({
            app,
            text: 'The actual creation will take place with the first transaction,<br>until now it will only be kept in the application.'
        }));
    }

}
