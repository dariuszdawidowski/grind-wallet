/**
 * Mock for console object
 * Used in tests to suppress console output and track console calls
 */

const consoleMock = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    table: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    groupCollapsed: jest.fn(),
    clear: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
    timeLog: jest.fn(),
    count: jest.fn(),
    countReset: jest.fn()
};

global.console = {
    ...console,
    ...consoleMock
};

module.exports = consoleMock;
