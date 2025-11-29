const {
    isPasswordStrong,
    generateSalt,
    hashPassword,
    verifyPassword
} = require('../password.js');

describe('isPasswordStrong', () => {
    test('accepts strong password with all required elements', () => {
        expect(isPasswordStrong('Strong1Pass!')).toBe(true);
        expect(isPasswordStrong('MyP@ssw0rd')).toBe(true);
        expect(isPasswordStrong('Tr0ng!Pass')).toBe(true);
    });

    test('rejects password without lowercase letters', () => {
        expect(isPasswordStrong('STRONG1PASS!')).toBe(false);
    });

    test('rejects password without uppercase letters', () => {
        expect(isPasswordStrong('strong1pass!')).toBe(false);
    });

    test('rejects password without numbers', () => {
        expect(isPasswordStrong('StrongPass!')).toBe(false);
    });

    test('rejects password without special characters', () => {
        expect(isPasswordStrong('Strong1Pass')).toBe(false);
    });

    test('rejects password shorter than 8 characters', () => {
        expect(isPasswordStrong('Str0ng!')).toBe(false);
        expect(isPasswordStrong('Aa1!')).toBe(false);
    });

    test('accepts password with exactly 8 characters', () => {
        expect(isPasswordStrong('Str0ng!P')).toBe(true);
    });

    test('handles empty string', () => {
        expect(isPasswordStrong('')).toBe(false);
    });
});

describe('generateSalt', () => {
    test('generates salt with default length of 16', async () => {
        const salt = await generateSalt();
        expect(salt.length).toBe(16);
    });

    test('generates salt with custom length', async () => {
        const salt = await generateSalt(32);
        expect(salt.length).toBe(32);
    });

    test('generates different salts on multiple calls', async () => {
        const salt1 = await generateSalt();
        const salt2 = await generateSalt();
        expect(salt1).not.toBe(salt2);
    });

    test('generates salt as string', async () => {
        const salt = await generateSalt();
        expect(typeof salt).toBe('string');
    });
});

describe('hashPassword', () => {
    test('generates hash for valid password and salt', async () => {
        const hash = await hashPassword('TestPassword123', 'randomsalt');
        expect(typeof hash).toBe('string');
        expect(hash.length).toBeGreaterThan(0);
    });

    test('generates same hash for same password and salt', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash1 = await hashPassword(password, salt);
        const hash2 = await hashPassword(password, salt);
        expect(hash1).toBe(hash2);
    });

    test('generates different hashes for different passwords', async () => {
        const salt = 'randomsalt';
        const hash1 = await hashPassword('Password1', salt);
        const hash2 = await hashPassword('Password2', salt);
        expect(hash1).not.toBe(hash2);
    });

    test('generates different hashes for different salts', async () => {
        const password = 'TestPassword123';
        const hash1 = await hashPassword(password, 'salt1');
        const hash2 = await hashPassword(password, 'salt2');
        expect(hash1).not.toBe(hash2);
    });

    test('handles custom iteration count', async () => {
        const hash1 = await hashPassword('TestPass', 'salt', 100000);
        const hash2 = await hashPassword('TestPass', 'salt', 200000);
        expect(hash1).not.toBe(hash2);
    });
});

describe('verifyPassword', () => {
    test('verifies correct password', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword(password, salt, hash);
        expect(isValid).toBe(true);
    });

    test('rejects incorrect password', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword('WrongPassword', salt, hash);
        expect(isValid).toBe(false);
    });

    test('rejects with wrong salt', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await hashPassword(password, salt);
        const isValid = await verifyPassword(password, 'wrongsalt', hash);
        expect(isValid).toBe(false);
    });

    test('verifies with custom iteration count', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const iterations = 200000;
        const hash = await hashPassword(password, salt, iterations);
        const isValid = await verifyPassword(password, salt, hash, iterations);
        expect(isValid).toBe(true);
    });

    test('rejects when iteration count mismatches', async () => {
        const password = 'TestPassword123';
        const salt = 'randomsalt';
        const hash = await hashPassword(password, salt, 100000);
        const isValid = await verifyPassword(password, salt, hash, 200000);
        expect(isValid).toBe(false);
    });
});