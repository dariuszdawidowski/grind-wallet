/**
 * IndexedDB logging base
 */

export class LogBase {

    constructor() {
        // Database connection
        this.db = null;

        // Database version
        this.version = 1;
    }

    /**
     * Initialize database with store names
     * @param {string} dbName - Name of the database
     * @param {[string]} storeNames - Name of the object stores
     */

    async init(dbName, storeNames) {

        // Open DB connection
        return new Promise((resolve, reject) => {
            // First, open without specifying version to get current version
            const checkRequest = indexedDB.open(dbName);

            checkRequest.onsuccess = (event) => {
                const currentDb = event.target.result;
                const currentVersion = currentDb.version;
                currentDb.close();

                // Check if we need to upgrade
                const missingStores = storeNames.filter(store => !currentDb.objectStoreNames.contains(store));
                const needsUpgrade = missingStores.length > 0;

                // Open with correct version
                const request = indexedDB.open(dbName, needsUpgrade ? currentVersion + 1 : currentVersion);

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.version = this.db.version;
                    resolve();
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    // Create object stores for logs if it doesn't exist
                    for (const store of storeNames) {
                        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
                    }
                };
            };

            checkRequest.onerror = (event) => {
                // Database doesn't exist, create with version 1
                const request = indexedDB.open(dbName, 1);

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.version = this.db.version;
                    resolve();
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    for (const store of storeNames) {
                        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
                    }
                };
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
                    reject(event.target.error);
                };
            };
        });
    }

    /**
     * Add log entry
     * @param {string} storeName - Name of the object store
     * @param {string} key - key
     * @param {object} value - content
     */

    async add(storeName, key, value) {
        if (process.env.DEV_MODE) console.log(`[${key}]`, value);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value, key);
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
            
            request.onsuccess = () => {
                resolve();
            };
        });
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
                reject(event.target.error);
            };
            
            request.onsuccess = () => {
                resolve();
            };
        });
    }

}
