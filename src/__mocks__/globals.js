/**
 * Mock for browser globals (btoa, atob)
 * Used in tests that require Base64 encoding/decoding
 * Note: For more complete window mock, use window.js instead
 */

global.window = global.window || {};

global.window.btoa = global.window.btoa || jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));
global.window.atob = global.window.atob || jest.fn((str) => Buffer.from(str, 'base64').toString('binary'));

module.exports = {
    btoa: global.window.btoa,
    atob: global.window.atob
};
