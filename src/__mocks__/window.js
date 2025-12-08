/**
 * Mock for window object and its methods
 * Used in tests that require window/DOM functionality
 */

const windowMock = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    location: {
        href: 'http://localhost',
        pathname: '/',
        search: '',
        hash: ''
    },
    localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
    },
    sessionStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
    },
    navigator: {
        userAgent: 'Mozilla/5.0 (Test)',
        language: 'en-US'
    },
    btoa: jest.fn((str) => Buffer.from(str, 'binary').toString('base64')),
    atob: jest.fn((str) => Buffer.from(str, 'base64').toString('binary'))
};

global.window = windowMock;

module.exports = windowMock;
