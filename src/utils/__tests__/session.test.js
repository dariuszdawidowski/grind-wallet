const { Session } = require('../session.js');

describe('isPasswordStrong', () => {
    let session;

    beforeEach(() => {
        session = new Session();
    });

    test('accepts strong password with all required elements', () => {
        expect(session.isPasswordStrong('Strong1Pass!')).toBe(true);
        expect(session.isPasswordStrong('MyP@ssw0rd')).toBe(true);
        expect(session.isPasswordStrong('Tr0ng!Pass')).toBe(true);
    });

    test('rejects password without lowercase letters', () => {
        expect(session.isPasswordStrong('STRONG1PASS!')).toBe(false);
    });

    test('rejects password without uppercase letters', () => {
        expect(session.isPasswordStrong('strong1pass!')).toBe(false);
    });

    test('rejects password without numbers', () => {
        expect(session.isPasswordStrong('StrongPass!')).toBe(false);
    });

    test('rejects password without special characters', () => {
        expect(session.isPasswordStrong('Strong1Pass')).toBe(false);
    });

    test('rejects password shorter than 8 characters', () => {
        expect(session.isPasswordStrong('Str0ng!')).toBe(false);
        expect(session.isPasswordStrong('Aa1!')).toBe(false);
    });

    test('accepts password with exactly 8 characters', () => {
        expect(session.isPasswordStrong('Str0ng!P')).toBe(true);
    });

    test('handles empty string', () => {
        expect(session.isPasswordStrong('')).toBe(false);
    });
});

describe('generateSalt', () => {
    let session;

    beforeEach(() => {
        session = new Session();
    });

    test('generates salt with default length of 16', async () => {
        const salt = await session.generateSalt();
        expect(salt.length).toBe(16);
    });

    test('generates salt with custom length', async () => {
        const salt = await session.generateSalt(32);
        expect(salt.length).toBe(32);
    });

    test('generates different salts on multiple calls', async () => {
        const salt1 = await session.generateSalt();
        const salt2 = await session.generateSalt();
        expect(salt1).not.toBe(salt2);
    });

    test('generates salt as string', async () => {
        const salt = await session.generateSalt();
        expect(typeof salt).toBe('string');
    });
});

describe('hashPassword', () => {
    let session;

    beforeEach(() => {
        session = new Session();
    });

    test('generates hash for valid password and salt', async () => {
        const hash = await session.hashPassword('TestPassword123', 'randomsalt');
        expect(typeof hash).toBe('string');
        expect(hash.length).toBeGreaterThan(0);
    });

    test('generates same hash for same password and salt', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash1 = await session.hashPassword(password, salt);
        const hash2 = await session.hashPassword(password, salt);
        expect(hash1).toBe(hash2);
    });

    test('generates different hashes for different passwords', async () => {
        const salt = 'randomsalt';
        const hash1 = await session.hashPassword('Password1', salt);
        const hash2 = await session.hashPassword('Password2', salt);
        expect(hash1).not.toBe(hash2);
    });

    test('generates different hashes for different salts', async () => {
        const password = 'TestPassword123';
        const hash1 = await session.hashPassword(password, 'salt1');
        const hash2 = await session.hashPassword(password, 'salt2');
        expect(hash1).not.toBe(hash2);
    });

    test('handles custom iteration count', async () => {
        const hash1 = await session.hashPassword('TestPass', 'salt', 100000);
        const hash2 = await session.hashPassword('TestPass', 'salt', 200000);
        expect(hash1).not.toBe(hash2);
    });
});

describe('verifyPassword', () => {
    let session;

    beforeEach(() => {
        session = new Session();
    });

    test('verifies correct password', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await session.hashPassword(password, salt);
        const isValid = await session.verifyPassword(password, salt, hash);
        expect(isValid).toBe(true);
    });

    test('rejects incorrect password', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await session.hashPassword(password, salt);
        const isValid = await session.verifyPassword('WrongPassword', salt, hash);
        expect(isValid).toBe(false);
    });

    test('rejects with wrong salt', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await session.hashPassword(password, salt);
        const isValid = await session.verifyPassword(password, 'wrongsalt', hash);
        expect(isValid).toBe(false);
    });

    test('verifies with custom iteration count', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const iterations = 200000;
        const hash = await session.hashPassword(password, salt, iterations);
        const isValid = await session.verifyPassword(password, salt, hash, iterations);
        expect(isValid).toBe(true);
    });

    test('rejects when iteration count mismatches', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await session.hashPassword(password, salt, 100000);
        const isValid = await session.verifyPassword(password, salt, hash, 200000);
        expect(isValid).toBe(false);
    });
});