/**
 * Error handling system for the application
 */

import { LogBase } from './logbase.js';

export class ErrorSystem extends LogBase {

    constructor(args) {
        super(args);

        const timestamp = new Date().getTime();

        // Global error handler
        window.addEventListener('error', (ev) => {
            console.log('🪲', ev);
            this.add('list', timestamp, ev?.error?.stack || ev.message || 'Unknown error');
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (ev) => {
            console.log('🐞', ev);
            this.add('list', timestamp, ev?.reason?.stack || 'Unknown error');
        });

        // Console error override
        const origConsoleError = console.error;
        console.error = function(...args) {
            this.add('list', timestamp, args.map(arg => (typeof arg === 'string') ? arg : JSON.stringify(arg)).join(' '));
            origConsoleError.apply(console, args);
        }
        
    }

    /**
     * Get filtered or all logs
     */

    async get(storeName, args = null) {
        const logs = await this.load(storeName);
        return logs;
    }

}
