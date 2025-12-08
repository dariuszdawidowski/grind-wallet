/**
 * Mock for IndexedDB API
 * Used in tests that require database functionality
 */

const indexedDBMock = {
    open: jest.fn((name, version) => {
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: {
                transaction: jest.fn((storeNames, mode) => ({
                    objectStore: jest.fn((storeName) => ({
                        add: jest.fn(() => ({ onsuccess: null, onerror: null })),
                        put: jest.fn(() => ({ onsuccess: null, onerror: null })),
                        get: jest.fn(() => ({ onsuccess: null, onerror: null })),
                        delete: jest.fn(() => ({ onsuccess: null, onerror: null })),
                        clear: jest.fn(() => ({ onsuccess: null, onerror: null })),
                        openCursor: jest.fn(() => ({ onsuccess: null, onerror: null }))
                    }))
                })),
                createObjectStore: jest.fn((name, options) => ({
                    createIndex: jest.fn()
                })),
                close: jest.fn()
            }
        };
        return request;
    }),
    deleteDatabase: jest.fn(() => ({
        onsuccess: null,
        onerror: null
    }))
};

global.indexedDB = indexedDBMock;

module.exports = indexedDBMock;
