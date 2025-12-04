/**
 * Error handling system for the application
 */

import { LogBase } from './logbase.js';

export class ErrorSystem extends LogBase {

    constructor(args) {
        super();

        this.app = args.app;

        // Global error handler
        window.addEventListener('error', (ev) => {
            this.error(ev?.error?.stack || ev.message || 'Unknown error');
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (ev) => {
            this.error(ev?.reason?.stack || 'Unknown error');
        });

        // Console error override
        const origConsoleError = console.error;
        console.error = (...errorArgs) => {
            this.error(errorArgs.map(arg => (typeof arg === 'string') ? arg : JSON.stringify(arg)).join(' '));
            origConsoleError.apply(console, errorArgs);
        }
        
    }

    /**
     * Add error
     */

    error(msg) {
        const timestamp = new Date().getTime();
        this.add(this.app.version, timestamp, msg);
        if (this.app.config.sendErrors) this.app.backend.writeErrorLog(this.app.config.clientId, msg);
    }

    /**
     * Get filtered or all logs
     */

    async get() {
        return await this.load(this.app.version);
    }

}
