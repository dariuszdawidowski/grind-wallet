/**
 * Error handling system for the application
 */

import { LogBase } from './logbase.js';
import { hashString } from './general.js';

export class ErrorSystem extends LogBase {

    constructor(args) {
        super();

        this.app = args.app;

        // Anti-flood mechanism: track recent error hashes with timestamps
        this.errorCache = new Map();
        
        // Anti-flood configuration (can be overridden)
        this.antiFloodWindow = 60000; // 60 seconds default window
        this.cleanupInterval = 300000; // Cleanup old entries every 5 minutes

        // Periodic cleanup of old error cache entries
        this.cleanupIntervalId = setInterval(() => this.cleanupErrorCache(), this.cleanupInterval);

        // Global error handler
        window.addEventListener('error', (ev) => {
            this.error(ev?.error?.stack || ev.message || 'Unknown error').catch(() => {});
        });

        // Global promise rejection handler
        window.addEventListener('unhandledrejection', (ev) => {
            this.error(ev?.reason?.stack || 'Unknown error').catch(() => {});
        });

        // Console error override
        const origConsoleError = console.error;
        console.error = (...errorArgs) => {
            this.error(errorArgs.map(arg => (typeof arg === 'string') ? arg : JSON.stringify(arg)).join(' ')).catch(() => {});
            origConsoleError.apply(console, errorArgs);
        }
        
    }

    /**
     * Cleanup old entries from error cache
     */

    cleanupErrorCache() {
        const now = Date.now();
        for (const [hash, timestamp] of this.errorCache.entries()) {
            if (now - timestamp > this.antiFloodWindow) {
                this.errorCache.delete(hash);
            }
        }
    }

    /**
     * Check if error should be logged (anti-flood check)
     * @param {string} errorHash - Hash of the error message
     * @return {boolean} - True if error should be logged
     */

    shouldLogError(errorHash) {
        const now = Date.now();
        const lastSeen = this.errorCache.get(errorHash);
        
        if (!lastSeen || (now - lastSeen) > this.antiFloodWindow) {
            this.errorCache.set(errorHash, now);
            return true;
        }
        
        return false;
    }

    /**
     * Add error
     */

    async error(msg) {
        // Generate hash of error message for deduplication
        const errorHash = await hashString(msg);
        
        // Check anti-flood: only log if not seen recently
        if (!this.shouldLogError(errorHash)) {
            return;
        }
        
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

    /**
     * Cleanup method to stop the interval timer
     */

    destroy() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
    }

}
