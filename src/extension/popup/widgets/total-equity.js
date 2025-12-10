/**
 * Total Equity Widget
 */

import '/src/extension/popup/styles/total-equity.css';
import { Component } from '/src/utils/component.js';

export class TotalEquity extends Component {

    /**
     * Constructor
     * @param {object} args.app - application instance
     */

    constructor(args) {
        super(args);

        // Build
        this.element.classList.add('tile', 'big', 'total-equity');

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = 'Total Equity';
        this.element.append(title);

        this.equityValue = document.createElement('div');
        this.equityValue.classList.add('equity-value');
        this.equityValue.textContent = '$123 456 789.00';
        this.element.append(this.equityValue);
    }

}
