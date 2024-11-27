import { Component } from '/src/utils/Component.js';
//import { formatWithSpaces, formatE8S } from '/src/utils/Currency.js';


export class AddCoin extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

        // Build
        this.element.classList.add('add-coin');
        this.element.innerHTML = `
            <div class="plus"><img src="assets/material-design-icons/plus.svg"></img></div>
            <div class="label">Add custom coin</div>
        `;

        // Events
        this.element.addEventListener('click', args.click);

    }
    
}

export class Coin extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

    }

}
