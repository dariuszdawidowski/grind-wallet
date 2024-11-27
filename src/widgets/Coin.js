import { Component } from '/src/utils/Component.js';
//import { formatWithSpaces, formatE8S } from '/src/utils/Currency.js';


export class Coin extends Component {

    constructor(args) {
        super(args);

        // Wallet reference
        this.wallet = args.wallet;

    }

}
