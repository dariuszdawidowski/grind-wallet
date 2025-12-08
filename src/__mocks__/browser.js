/**
 * Mock for browser extension API (browser.storage, browser.runtime)
 * Used in tests that require browser extension functionality
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
