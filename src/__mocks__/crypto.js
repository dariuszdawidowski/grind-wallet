/**
 * Mock for Web Crypto API
 * Used in tests that require cryptographic operations
 */

const mockCrypto = {
    subtle: {
        importKey: jest.fn(),
        deriveKey: jest.fn(),
        encrypt: jest.fn(),
        decrypt: jest.fn(),
        digest: jest.fn()
    },
    getRandomValues: jest.fn((array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    })
};

global.crypto = mockCrypto;

module.exports = { mockCrypto };
