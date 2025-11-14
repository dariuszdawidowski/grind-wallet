/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';
import { Button } from '/src/chrome-extension/popup/widgets/button.js';

export class TaskMintCK extends Task {

    /**
     * Constructor for minting Chain-key token task
     */

    constructor({ app, address, amount, symbol, fee, min } = {}) {
        super({ app, duration: -1 });

        // Task details
        this.task.address = address;
        this.task.amount = amount;
        this.task.symbol = symbol;
        this.task.fee = fee;
        this.task.min = min;
        const symbols = this.getSymbol(symbol);
        this.task.description = `Minting ${amount} ${symbols.from} &rarr; ${symbols.to}`;

        // Build
        this.element.classList.add('form');

        // Show transaction history
        this.append(new Button({
            icon: '<img src="assets/material-design-icons/history.svg">',
            text: 'Hello world',
            click: () => {
            }
        }));

    }

    /**
     * Get symbol from
     */

    getSymbol(symbol) {
        switch (symbol.toLowerCase()) {
            case 'btc':
                return { from: 'BTC', to: 'ckBTC' };
            default:
                return { from: '', to: '' };
        }
    }

    /**
     * Serialize task data
     */

    serialize() {
        return {
            class: 'TaskMintCK',
            description: this.task.description,
            created: this.task.created,
            duration: this.task.duration,
            address: this.task.address,
            amount: this.task.amount,
            min: this.task.min,
            symbol: this.task.symbol,
            fee: this.task.fee
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

}
