/**
 * Storing operation history in Chrome extension's persistent storage
 */

export class LogSystem {
    constructor() {
        this.logs = [];
        this.STORAGE_KEY = 'transactions';
        this.STORAGE_LIMIT_WARNING = 4 * 1024 * 1024; // 4MB (80% limitu 5MB)
        this.initialized = this.initialize();
    }

    async initialize() {
        await this.load();
        
        try {
            chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
                console.log(`Storage usage: ${(bytesInUse / (1024 * 1024)).toFixed(2)}MB / 5MB`);
                // If approaching the limit, clean up old entries
                if (bytesInUse > this.STORAGE_LIMIT_WARNING) {
                    console.warn('Storage is approaching its limit, cleaning up old logs');
                    // Remove entries older than a year
                    this.purge({ daysToKeep: 365 }).then(removed => {
                        console.log(`Removed ${removed} old log entries`);
                    });
                }
            });
        }
        catch (e) {
            console.error('Error checking storage size:', e);
        }
    }

    async load() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.STORAGE_KEY], (result) => {
                if (result[this.STORAGE_KEY]) {
                    this.logs = result[this.STORAGE_KEY];
                }
                resolve();
            });
        });
    }

    async save() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: this.logs }, resolve);
        });
    }

    async add(entry) {
        await this.initialized;
        const timestamp = new Date().toISOString();
        this.logs.push({ timestamp, entry });
        console.log(`[${timestamp}] ${entry}`);
        await this.save();
    }

    async get() {
        await this.initialized;
        return this.logs;
    }

    async clear() {
        await this.initialized;
        this.logs = [];
        await this.save();
    }
    
    /**
     * Removes old log entries
     * @param {Object} options - Cleanup options
     * @param {number} options.daysToKeep - Number of days of entries to keep
     * @param {number} options.maxEntries - Maximum number of entries to keep
     * @returns {number} - Number of deleted entries
     */

    async purge(options = {}) {
        await this.initialized;
        const oldLength = this.logs.length;
        
        // Remove entries older than X days
        if (options.daysToKeep) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - options.daysToKeep);
            const cutoffTimestamp = cutoffDate.toISOString();            
            this.logs = this.logs.filter(log => log.timestamp >= cutoffTimestamp);
        }

        // Limit to maximum number of entries
        if (options.maxEntries && this.logs.length > options.maxEntries) {
            this.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            this.logs = this.logs.slice(0, options.maxEntries);
        }
        
        // Save changes
        await this.save();

        // Return the number of deleted entries
        return oldLength - this.logs.length;
    }
}
