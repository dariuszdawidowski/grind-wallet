import { Component } from '../../Boost.js';
import { formatCurrency } from '../../Utils.js';
import { Button } from '../../widgets/Button.js';


export class SheetReceiveAccount extends Component {

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('form');
        this.element.innerHTML = 'Receive';

    }

}

