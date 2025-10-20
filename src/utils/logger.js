/**
 * Storing operation history in Chrome extension's persistent storage
 */

export class LogSystem {

    constructor() {

        // { { isodatetime: { pid: principalId, <other params> }, ... }
        this.logs = {};

        this.STORAGE_KEY = 'transactions';
        this.STORAGE_LIMIT_WARNING = 4 * 1024 * 1024; // 4MB (80% limitu 5MB)
        this.initialized = this.initialize();
    }

    /**
     * Initialize
     */

    async initialize() {

        // Load logs
        await this.load();

        // Purge storage when close to limits
        try {
            chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
                if (process.env.DEV_MODE) console.log(`Storage usage: ${(bytesInUse / (1024 * 1024)).toFixed(2)}MB / 5MB`);
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

    /**
     * Load all logs
     */

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

    /**
     * Save all logs
     */

    async save() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: this.logs }, resolve);
        });
    }

    /**
     * Add log entry
     */

    async add(entry) {
        await this.initialized;
        const timestamp = new Date().toISOString();
        this.logs[timestamp] = entry;
        if (process.env.DEV_MODE) console.log(`[${timestamp}]`, entry);
        await this.save();
    }

    /**
     * Get filtered or all logs
     */

    async get(args = null) {
        await this.initialized;

        // Filtered by Principal ID
        if (args !== null) {
            return Object.fromEntries(Object.entries(this.logs).filter(([_, entry]) => {
                let result = true;
                // Filter by principal ID
                if ('pid' in args) result = result && entry.pid === args.pid;
                return result;
            }));
        }

        // All
        return this.logs;
    }

    /**
     * Clear all logs
     */

    async clear() {
        await this.initialized;
        this.logs = {};
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
        const oldLength = Object.keys(this.logs).length;        
        const newLogs = {};
        let timestamps = Object.keys(this.logs);
        
        // Remove entries older than X days
        if (options.daysToKeep) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - options.daysToKeep);
            const cutoffTimestamp = cutoffDate.toISOString();            
            timestamps = timestamps.filter(timestamp => timestamp >= cutoffTimestamp);
        }
        
        // Limit to maximum number of entries (sortujemy od najnowszych)
        if (options.maxEntries && timestamps.length > options.maxEntries) {
            timestamps.sort((a, b) => b.localeCompare(a));
            timestamps = timestamps.slice(0, options.maxEntries);
        }
                
        // Save changes
        timestamps.forEach(timestamp => {
            newLogs[timestamp] = this.logs[timestamp];
        });
        this.logs = newLogs;
        await this.save();

        // Return the number of deleted entries
        return oldLength - Object.keys(this.logs).length;
    }
}
