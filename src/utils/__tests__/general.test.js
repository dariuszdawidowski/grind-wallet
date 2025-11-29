const {
    ONE_SECOND,
    ONE_MINUTE,
    ONE_HOUR,
    ONE_DAY,
    ONE_WEEK,
    memo2Binary,
    isValidCanisterId,
    shortPrincipalId,
    shortAccountId,
    shortAddress,
    timestampNanos2ISO,
    hashBuffer,
    hashString
} = require('../general.js');

describe('Time constants', () => {
    test('ONE_SECOND equals 1000 milliseconds', () => {
        expect(ONE_SECOND).toBe(1000);
    });

    test('ONE_MINUTE equals 60 seconds', () => {
        expect(ONE_MINUTE).toBe(60000);
    });

    test('ONE_HOUR equals 60 minutes', () => {
        expect(ONE_HOUR).toBe(3600000);
    });

    test('ONE_DAY equals 24 hours', () => {
        expect(ONE_DAY).toBe(86400000);
    });

    test('ONE_WEEK equals 7 days', () => {
        expect(ONE_WEEK).toBe(604800000);
    });
});

describe('memo2Binary', () => {
    test('converts memo to 4-byte Uint8Array', () => {
        const result = memo2Binary(12345);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(4);
    });

    test('converts zero correctly', () => {
        const result = memo2Binary(0);
        expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });

    test('converts small number correctly', () => {
        const result = memo2Binary(1);
        expect(result).toEqual(new Uint8Array([1, 0, 0, 0]));
    });

    test('handles MAX_UINT32 overflow', () => {
        const result = memo2Binary(0xFFFFFFFF + 1);
        expect(result).toEqual(new Uint8Array([0, 0, 0, 0]));
    });
});

describe('isValidCanisterId', () => {
    test('validates correct canister ID format', () => {
        expect(isValidCanisterId('ryjl3-tyaaa-aaaaa-aaaba-cai')).toBe(true);
        expect(isValidCanisterId('qhbym-qaaaa-aaaaa-aaafq-cai')).toBe(true);
    });

    test('rejects invalid canister ID formats', () => {
        expect(isValidCanisterId('invalid')).toBe(false);
        expect(isValidCanisterId('12345-67890')).toBe(false);
        expect(isValidCanisterId('RYJL3-TYAAA-AAAAA-AAABA-CAI')).toBe(false);
        expect(isValidCanisterId('ryjl3-tyaaa-aaaaa-aaaba')).toBe(false);
        expect(isValidCanisterId('')).toBe(false);
    });
});

describe('shortPrincipalId', () => {
    test('shortens principal ID with multiple parts', () => {
        const result = shortPrincipalId('ryjl3-tyaaa-aaaaa-aaaba-cai');
        expect(result).toBe('ryjl3...cai');
    });

    test('returns original if less than 2 parts', () => {
        expect(shortPrincipalId('single')).toBe('single');
        expect(shortPrincipalId('')).toBe('');
    });
});

describe('shortAccountId', () => {
    test('shortens account ID to first 4 and last 4 characters', () => {
        const accountId = '1234567890abcdef';
        const result = shortAccountId(accountId);
        expect(result).toBe('1234...cdef');
    });

    test('handles short account IDs', () => {
        const result = shortAccountId('12345678');
        expect(result).toBe('1234...5678');
    });
});

describe('shortAddress', () => {
    test('detects and shortens principal ID', () => {
        const result = shortAddress('ryjl3-tyaaa-aaaaa-aaaba-cai');
        expect(result).toBe('ryjl3...cai');
    });

    test('detects and shortens account ID', () => {
        const result = shortAddress('1234567890abcdef');
        expect(result).toBe('1234...cdef');
    });
});

describe('timestampNanos2ISO', () => {
    test('converts nanoseconds timestamp to ISO string', () => {
        const nanos = 1609459200000000000n;
        const result = timestampNanos2ISO(nanos);
        expect(result).toBe('2021-01-01T00:00:00.000Z');
    });

    test('handles BigInt input', () => {
        const nanos = BigInt('1234567890000000000');
        const result = timestampNanos2ISO(nanos);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
});

describe('hashBuffer', () => {
    test('generates SHA-256 hash of buffer', async () => {
        const buffer = new Uint8Array([1, 2, 3, 4]).buffer;
        const hash = await hashBuffer(buffer);
        expect(hash).toBe('9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a');
    });

    test('generates different hashes for different buffers', async () => {
        const buffer1 = new Uint8Array([1, 2, 3]).buffer;
        const buffer2 = new Uint8Array([4, 5, 6]).buffer;
        const hash1 = await hashBuffer(buffer1);
        const hash2 = await hashBuffer(buffer2);
        expect(hash1).not.toBe(hash2);
    });
});

describe('hashString', () => {
    test('generates SHA-256 hash of string', async () => {
        const hash = await hashString('hello');
        expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    test('generates different hashes for different strings', async () => {
        const hash1 = await hashString('test1');
        const hash2 = await hashString('test2');
        expect(hash1).not.toBe(hash2);
    });

    test('handles empty string', async () => {
        const hash = await hashString('');
        expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
});