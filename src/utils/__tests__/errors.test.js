/**
 * Tests for ErrorSystem anti-flood mechanism
 */

const { ErrorSystem } = require('../errors.js');
const { hashString } = require('../general.js');

// Import universal mocks
require('../../__mocks__/window.js');
require('../../__mocks__/console.js');
require('../../__mocks__/indexeddb.js');

describe('ErrorSystem Anti-Flood Mechanism', () => {
    let errorSystem;
    let mockApp;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Mock app object
        mockApp = {
            version: 'test-version',
            config: {
                sendErrors: false
            },
            backend: {
                writeErrorLog: jest.fn()
            }
        };

        // Create error system instance
        errorSystem = new ErrorSystem({ app: mockApp });
        
        // Mock the db property to avoid initialization errors
        errorSystem.db = {
            transaction: jest.fn(() => ({
                objectStore: jest.fn(() => ({
                    put: jest.fn(() => ({
                        onsuccess: null,
                        onerror: null
                    }))
                }))
            }))
        };

        // Mock the add method to avoid IndexedDB operations
        errorSystem.add = jest.fn();
    });

    afterEach(() => {
        // Clear any intervals and cleanup
        if (errorSystem) {
            errorSystem.destroy();
            errorSystem.errorCache.clear();
        }
    });

    describe('shouldLogError', () => {
        test('should return true for new error hash', () => {
            const errorHash = 'test-hash-123';
            const result = errorSystem.shouldLogError(errorHash);
            expect(result).toBe(true);
        });

        test('should return false for duplicate error within time window', () => {
            const errorHash = 'test-hash-456';
            
            // First call should return true
            const firstResult = errorSystem.shouldLogError(errorHash);
            expect(firstResult).toBe(true);
            
            // Second call within window should return false
            const secondResult = errorSystem.shouldLogError(errorHash);
            expect(secondResult).toBe(false);
        });

        test('should return true for duplicate error after time window', () => {
            const errorHash = 'test-hash-789';
            
            // First call
            errorSystem.shouldLogError(errorHash);
            
            // Manually update timestamp to simulate time passing
            const now = Date.now();
            errorSystem.errorCache.set(errorHash, now - errorSystem.antiFloodWindow - 1000);
            
            // Should return true after window expires
            const result = errorSystem.shouldLogError(errorHash);
            expect(result).toBe(true);
        });

        test('should track timestamps correctly', () => {
            const errorHash = 'test-hash-abc';
            const before = Date.now();
            
            errorSystem.shouldLogError(errorHash);
            
            const timestamp = errorSystem.errorCache.get(errorHash);
            const after = Date.now();
            
            expect(timestamp).toBeGreaterThanOrEqual(before);
            expect(timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('cleanupErrorCache', () => {
        test('should remove expired entries from cache', () => {
            const now = Date.now();
            const oldTimestamp = now - errorSystem.antiFloodWindow - 1000;
            const recentTimestamp = now - 1000;
            
            errorSystem.errorCache.set('old-error', oldTimestamp);
            errorSystem.errorCache.set('recent-error', recentTimestamp);
            
            expect(errorSystem.errorCache.size).toBe(2);
            
            errorSystem.cleanupErrorCache();
            
            expect(errorSystem.errorCache.size).toBe(1);
            expect(errorSystem.errorCache.has('old-error')).toBe(false);
            expect(errorSystem.errorCache.has('recent-error')).toBe(true);
        });

        test('should not remove entries within time window', () => {
            const now = Date.now();
            const timestamp = now - 30000; // 30 seconds ago
            
            errorSystem.errorCache.set('error-1', timestamp);
            errorSystem.errorCache.set('error-2', timestamp);
            
            errorSystem.cleanupErrorCache();
            
            expect(errorSystem.errorCache.size).toBe(2);
        });

        test('should handle empty cache', () => {
            expect(errorSystem.errorCache.size).toBe(0);
            errorSystem.cleanupErrorCache();
            expect(errorSystem.errorCache.size).toBe(0);
        });
    });

    describe('error method with anti-flood', () => {
        test('should log unique errors', async () => {
            await errorSystem.error('Error message 1');
            await errorSystem.error('Error message 2');
            
            expect(errorSystem.add).toHaveBeenCalledTimes(2);
        });

        test('should not log duplicate errors within time window', async () => {
            const errorMessage = 'Duplicate error message';
            
            await errorSystem.error(errorMessage);
            await errorSystem.error(errorMessage);
            await errorSystem.error(errorMessage);
            
            // Should only log once
            expect(errorSystem.add).toHaveBeenCalledTimes(1);
        });

        test('should log error again after time window expires', async () => {
            const errorMessage = 'Repeating error';
            const errorHash = await hashString(errorMessage);
            
            // First error
            await errorSystem.error(errorMessage);
            expect(errorSystem.add).toHaveBeenCalledTimes(1);
            
            // Simulate time passing
            const now = Date.now();
            errorSystem.errorCache.set(errorHash, now - errorSystem.antiFloodWindow - 1000);
            
            // Second error after window
            await errorSystem.error(errorMessage);
            expect(errorSystem.add).toHaveBeenCalledTimes(2);
        });

        test('should not send to backend for duplicate errors', async () => {
            mockApp.config.sendErrors = true;
            errorSystem = new ErrorSystem({ app: mockApp });
            errorSystem.db = { transaction: jest.fn() };
            errorSystem.add = jest.fn();
            
            const errorMessage = 'Backend test error';
            
            await errorSystem.error(errorMessage);
            await errorSystem.error(errorMessage);
            
            // Should only call backend once
            expect(mockApp.backend.writeErrorLog).toHaveBeenCalledTimes(1);
        });

        test('should handle errors in rapid succession (loop simulation)', async () => {
            const errorMessage = 'Loop error';
            const iterations = 1000;
            
            // Simulate error happening 1000 times in a loop
            for (let i = 0; i < iterations; i++) {
                await errorSystem.error(errorMessage);
            }
            
            // Should only log once despite 1000 calls
            expect(errorSystem.add).toHaveBeenCalledTimes(1);
        });
    });

    describe('configuration', () => {
        test('should use default anti-flood window', () => {
            expect(errorSystem.antiFloodWindow).toBe(60000); // 60 seconds
        });

        test('should use default cleanup interval', () => {
            expect(errorSystem.cleanupInterval).toBe(300000); // 5 minutes
        });

        test('should allow custom anti-flood window', () => {
            const customWindow = 30000; // 30 seconds
            errorSystem.antiFloodWindow = customWindow;
            expect(errorSystem.antiFloodWindow).toBe(customWindow);
        });
    });

    describe('errorCache Map', () => {
        test('should initialize as empty Map', () => {
            expect(errorSystem.errorCache).toBeInstanceOf(Map);
            expect(errorSystem.errorCache.size).toBe(0);
        });

        test('should store error hashes as keys', async () => {
            const errorMessage = 'Test error';
            const errorHash = await hashString(errorMessage);
            
            await errorSystem.error(errorMessage);
            
            expect(errorSystem.errorCache.has(errorHash)).toBe(true);
        });

        test('should store timestamps as values', async () => {
            const errorMessage = 'Test error with timestamp';
            const errorHash = await hashString(errorMessage);
            
            await errorSystem.error(errorMessage);
            
            const timestamp = errorSystem.errorCache.get(errorHash);
            expect(typeof timestamp).toBe('number');
            expect(timestamp).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('destroy method', () => {
        test('should clear the cleanup interval', () => {
            expect(errorSystem.cleanupIntervalId).toBeDefined();
            expect(errorSystem.cleanupIntervalId).not.toBeNull();
            
            errorSystem.destroy();
            
            expect(errorSystem.cleanupIntervalId).toBeNull();
        });

        test('should be safe to call multiple times', () => {
            errorSystem.destroy();
            errorSystem.destroy();
            
            expect(errorSystem.cleanupIntervalId).toBeNull();
        });
    });
});
