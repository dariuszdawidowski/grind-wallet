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
            this.add(args.app.version, timestamp, ev?.error?.stack || ev.message || 'Unknown error');
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (ev) => {
            this.add(args.app.version, timestamp, ev?.reason?.stack || 'Unknown error');
        });

        // Console error override
        const origConsoleError = console.error;
        const self = this;
        const appVersion = args.app.version;
        console.error = function(...errorArgs) {
            self.add(appVersion, timestamp, errorArgs.map(arg => (typeof arg === 'string') ? arg : JSON.stringify(arg)).join(' '));
            origConsoleError.apply(console, errorArgs);
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
