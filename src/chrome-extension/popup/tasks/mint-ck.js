/**
 * Task: mint Chain-key token
 */

import { Task } from './task.js';

export class TaskMintCK extends Task {

    /**
     * Constructor for minting Chain-key token task
     */

    constructor() {
        super({
            description: 'Minting 1.0 BTC &rarr; ckBTC',
            duration: 20
        });
    }

}
