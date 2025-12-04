/**
 * Mock for browser extension API (chrome.storage)
 * Used in blockchain tests that require storage access
 */

module.exports = {
    browser: {
        storage: {
            local: {
                get: jest.fn(),
                set: jest.fn(),
                remove: jest.fn()
            },
            session: {
                get: jest.fn(),
                set: jest.fn(),
                remove: jest.fn()
            }
        },
        runtime: {
            sendMessage: jest.fn(),
            onMessage: {
                addListener: jest.fn()
            }
        }
    }
};
