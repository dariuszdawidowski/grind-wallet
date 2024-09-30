import { Component } from '../../Boost.js';
import { Button } from '../../Button.js';


export class CardNewAccount extends Component {

    constructor(app, args) {
        super(app);

        // Build
        this.element.innerHTML = `
            <center>
                This action will create a new free account<br>
                for the Internet Computer blockchain.
            </center>
        `;
    }

}
