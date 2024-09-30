import { Component } from '../../Boost.js';
import { Button } from '../../Button.js';


export class CardImportAccount extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.innerHTML = `
            <center>
                This action will import the Internet Computer<br>
                blockchain account from the recovery phrase.
            </center>
        `;
    }

}
