/**
 * Storing operation history in IndexedDB database
 */

export class LogSystem {

    constructor() {
        // Database connection
        this.db = null;
        this.STORE_NAME = 'Transactions';
        this.DB_NAME = 'Logs';
        this.DB_VERSION = 1;
        this.logs = {};
        this.STORAGE_LIMIT_WARNING = 50 * 1024 * 1024; // 50MB of storage limit in IndexedDB
        this.initialized = this.initialize();
    }

    /**
     * Initialize database
     */

    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object store for logs if it doesn't exist
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    // Use timestamp as key
                    db.createObjectStore(this.STORE_NAME);
                }
            };
            
            request.onsuccess = async (event) => {
                this.db = event.target.result;
                // Load existing logs
                await this.load();
                
                // Check storage usage
                try {
                    await this.checkStorageSize();
                } catch (e) {
                    console.error('Error checking storage size:', e);
                }
                
                resolve();
            };
        });
    }

    /**
     * Check storage size and purge if approaching limit
     */

    async checkStorageSize() {
        try {
            // Get approximate size by serializing to string
            const serialized = JSON.stringify(this.logs);
            const bytesInUse = new TextEncoder().encode(serialized).length;
            
            if (process.env.DEV_MODE) console.log(`Storage usage: ${(bytesInUse / (1024 * 1024)).toFixed(2)}MB`);
            
            // If approaching the limit, clean up old entries
            if (bytesInUse > this.STORAGE_LIMIT_WARNING) {
                console.warn('Storage is approaching its limit, cleaning up old logs');
                // Remove entries older than a year
                const removed = await this.purge({ daysToKeep: 365 });
                console.log(`Removed ${removed} old log entries`);
            }
        } catch (e) {
            console.error('Error estimating storage size:', e);
        }
    }

    /**
     * Load all logs from IndexedDB
     */

    async load() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();
            
            request.onerror = (event) => {
                console.error('Load error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                // Convert array of values with keys to object
                this.logs = {};
                const allRecords = store.getAllKeys();
                
                allRecords.onsuccess = (keysEvent) => {
                    const keys = keysEvent.target.result;
                    const values = event.target.result;
                    
                    for (let i = 0; i < keys.length; i++) {
                        this.logs[keys[i]] = values[i];
                    }
                    resolve();
                };
                
                allRecords.onerror = (event) => {
                    console.error('Load keys error:', event.target.error);
                    reject(event.target.error);
                };
            };
        });
    }

    /**
     * Save a specific log entry
     */

    async saveEntry(timestamp, entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(entry, timestamp);
            
            request.onerror = (event) => {
                console.error('Save error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = () => {
                resolve();
            };
        });
    }

    /**
     * Add log entry
     * @param {ISO Date} datetime - optional timestamp when rebuilding entries)
     * @param + any custom log content
     */

    async add(entry) {
        await this.initialized;
        const timestamp = ('datetime' in entry) ? entry.datetime : new Date().toISOString();
        this.logs[timestamp] = entry;
        if (process.env.DEV_MODE) console.log(`[${timestamp}]`, entry);
        await this.saveEntry(timestamp, entry);
    }

    /**
     * Get filtered or all logs
     */

    async get(args = null) {
        await this.initialized;

        // Filtered by Principal ID
        if (args !== null) {
            return Object.fromEntries(Object.entries(this.logs).filter(([datetime, entry]) => {
                let result = true;
                // Filter by ISO datetime key
                if ('datetime' in args) result = result && (datetime == args.datetime);
                // Filter by principal IDs
                if ('pids' in args) result = result && args.pids.includes(entry.pid);
                // Filter by types
                if ('types' in args) result = result && args.types.includes(entry.type);
                // Filter by tokens
                if ('tokens' in args) result = result && args.tokens.includes(entry?.token?.canister);
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
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.clear();
            
            request.onerror = (event) => {
                console.error('Clear error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = () => {
                this.logs = {};
                resolve();
            };
        });
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
        
        // Limit to maximum number of entries (sort from newest)
        if (options.maxEntries && timestamps.length > options.maxEntries) {
            timestamps.sort((a, b) => b.localeCompare(a));
            timestamps = timestamps.slice(0, options.maxEntries);
        }
                
        // Create a set of timestamps to keep for faster lookups
        const timestampsToKeep = new Set(timestamps);
        
        // Delete entries not in the keep list
        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAllKeys();
        
        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const allKeys = event.target.result;
                let deleteCount = 0;
                let completedOperations = 0;
                
                if (allKeys.length === 0) {
                    resolve(0);
                    return;
                }
                
                // Delete keys not in our keep set and update in-memory logs
                allKeys.forEach(key => {
                    if (!timestampsToKeep.has(key)) {
                        deleteCount++;
                        store.delete(key);
                    } else {
                        newLogs[key] = this.logs[key];
                    }
                    
                    completedOperations++;
                    if (completedOperations === allKeys.length) {
                        this.logs = newLogs;
                        resolve(oldLength - Object.keys(this.logs).length);
                    }
                });
            };
            
            request.onerror = () => {
                console.error('Error during purge operation');
                resolve(0);
            };
        });
    }
}
