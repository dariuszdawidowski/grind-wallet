import { Component } from '../Boost.js';


export class Card extends Component {

    constructor(args) {
        super(args.app);

        // Build
        this.element.id = args.id;
        this.element.classList.add('card');
        this.element.innerHTML = `
            <div class="name">ICP #1</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="currency">ICP</div>
            <div class="amount">0.000000</div>
            <div class="account1">aa39 b30e 61dd 2b18 1a5f 2df0</div>
            <div class="account2">50d3 f0de 1ca8 811a c7a3 52a3 af97 b0ff b29f 423a</div>
            <img class="logo" src="assets/IC_logo_horizontal.svg">
            <div class="open">
                Click to open
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="7" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                  <rect x="7" y="3" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                </svg>
            </div>
        `;


    }

}
