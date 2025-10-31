/**
 * Storing operation history in IndexedDB database
 */

export class LogSystem {

    constructor() {
        // Database connection
        this.db = null;
        this.DB_NAME = 'Logs';
        this.DB_VERSION = 1;
        this.STORAGE_LIMIT_WARNING = 50 * 1024 * 1024; // 50MB of storage limit in IndexedDB
    }

    /**
     * Initialize database with store names
     * @param {[string]} storeNames - Name of the object stores
     */

    async init(storeNames) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object stores for logs if it doesn't exist
                for (const store of storeNames) {
                    if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
                }
            };
            
            request.onsuccess = async (event) => {
                this.db = event.target.result;                
                resolve();
            };
        });
    }

    /**
     * Load all logs from IndexedDB
     * @param {string} storeName - Name of the object store
     * @return {Object} logs - All log entries
     */

    async load(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onerror = (event) => {
                console.error('Load error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                // Convert array of values with keys to object
                const logs = {};
                const allRecords = store.getAllKeys();
                
                allRecords.onsuccess = (keysEvent) => {
                    const keys = keysEvent.target.result;
                    const values = event.target.result;
                    
                    for (let i = 0; i < keys.length; i++) {
                        logs[keys[i]] = values[i];
                    }
                    resolve(logs);
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
     * @param {string} storeName - Name of the object store
     * @param {ISO Date} timestamp - Timestamp key for the log entry
     * @param {Object} entry - Log entry data
     */

    async saveEntry(storeName, timestamp, entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
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
     * @param {string} storeName - Name of the object store
     * @param {object} entry with iso datetime - log content
     */

    async add(storeName, entry) {
        const timestamp = ('datetime' in entry) ? entry.datetime : new Date().toISOString();
        if (process.env.DEV_MODE) console.log(`[${timestamp}]`, entry);
        await this.saveEntry(storeName, timestamp, entry);
    }

    /**
     * Get filtered or all logs
     */

    async get(storeName, args = null) {
        const logs = await this.load(storeName);

        // Optional filtering
        if (args !== null) {
            return Object.fromEntries(Object.entries(logs).filter(([datetime, entry]) => {
                let result = true;
                // Filter by ISO datetime key
                if ('datetime' in args) result = result && (datetime == args.datetime);
                // Filter by types
                if ('types' in args) result = result && args.types.includes(entry.type);
                // Filter by tokens
                if ('tokens' in args) result = result && args.tokens.includes(entry?.token?.canister);
                return result;
            }));
        }

        // All logs
        return logs;
    }

    /**
     * Clear logs
     * @param {string} storeName - Name of the object store
     */

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onerror = (event) => {
                console.error('Clear error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = () => {
                resolve();
            };
        });
    }

}
