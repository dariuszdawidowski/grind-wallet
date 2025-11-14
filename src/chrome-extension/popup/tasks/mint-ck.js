/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';

export class TaskMintCK extends Task {

    /**
     * Constructor for minting Chain-key token task
     */

    constructor({ amount, symbol }) {
        super({ duration: -1 });
        this.amount = amount;
        this.symbol = symbol;
        const symbols = this.getSymbol(symbol);
        this.description = `Minting ${amount} ${symbols.from} &rarr; ${symbols.to}`;
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
            description: this.description,
            duration: this.duration,
            amount: this.amount,
            symbol: this.symbol
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

}
