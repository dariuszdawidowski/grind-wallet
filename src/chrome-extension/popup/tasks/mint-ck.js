/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';

export class TaskMintCK extends Task {

    /**
     * Constructor for minting Chain-key token task
     */

    constructor({ address, amount, symbol, fee, min } = {}) {
        super({ duration: -1 });
        this.address = address;
        this.amount = amount;
        this.symbol = symbol;
        this.fee = fee;
        this.min = min;
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
            created: this.created,
            duration: this.duration,
            address: this.address,
            amount: this.amount,
            min: this.min,
            symbol: this.symbol,
            fee: this.fee
        };
    }

    /**
     * Deserialize task data
     */

    static deserialize(data) {
        return new TaskMintCK(data);
    }

}
