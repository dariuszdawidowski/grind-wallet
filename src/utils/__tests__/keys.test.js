const bip39 = require('bip39');
const hdkey = require('hdkey');
import { Secp256k1KeyIdentity } from '@icp-sdk/core/identity/secp256k1';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { hexStringToUint8Array } from '@dfinity/utils';
import {
    keysRecoverFromPhraseSecp256k1,
    identityFromPrivate,
    encryptKey,
    decryptKey,
    serializeEncryptKey,
    deserializeEncryptKey
} from '../keys.js';

// Mock external libraries
jest.mock('bip39');
jest.mock('hdkey');
jest.mock('@icp-sdk/core/identity/secp256k1');
jest.mock('@dfinity/ledger-icp');
jest.mock('@dfinity/utils');

// Mock Web Crypto API and browser globals
const { mockCrypto } = require('../../__mocks__/crypto.js');
require('../../__mocks__/globals.js');

describe('keysRecoverFromPhraseSecp256k1', () => {
    const mockMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const mockSeed = new Uint8Array(64);
    const mockPrivateKey = new Uint8Array(32);
    const mockIdentity = {
        toJSON: jest.fn(() => ['publicKey', 'privateKey']),
        getPrincipal: jest.fn(() => ({
            toString: () => 'aaaaa-aa'
        }))
    };
    const mockAccount = {
        toHex: jest.fn(() => 'abc123def456')
    };

    beforeEach(() => {
        jest.clearAllMocks();
        bip39.generateMnemonic.mockReturnValue(mockMnemonic);
        bip39.validateMnemonic.mockReturnValue(true);
        bip39.mnemonicToSeedSync.mockReturnValue(mockSeed);
        hdkey.fromMasterSeed.mockReturnValue({
            derive: jest.fn(() => ({ privateKey: mockPrivateKey }))
        });
        Secp256k1KeyIdentity.fromSecretKey.mockReturnValue(mockIdentity);
        AccountIdentifier.fromPrincipal.mockReturnValue(mockAccount);
    });

    test('generates new mnemonic when null is provided', () => {
        const result = keysRecoverFromPhraseSecp256k1(null);
        
        expect(bip39.generateMnemonic).toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result.mnemonic).toBe(mockMnemonic);
    });

    test('recovers keypair from valid mnemonic', () => {
        const result = keysRecoverFromPhraseSecp256k1(mockMnemonic);
        
        expect(bip39.validateMnemonic).toHaveBeenCalledWith(mockMnemonic);
        expect(bip39.mnemonicToSeedSync).toHaveBeenCalledWith(mockMnemonic);
        expect(result).toEqual({
            mnemonic: mockMnemonic,
            identity: mockIdentity,
            public: 'publicKey',
            private: 'privateKey',
            principal: 'aaaaa-aa',
            account: 'abc123def456'
        });
    });

    test('returns null for invalid mnemonic', () => {
        bip39.validateMnemonic.mockReturnValue(false);
        
        const result = keysRecoverFromPhraseSecp256k1('invalid mnemonic');
        
        expect(result).toBeNull();
    });

    test('uses correct BIP44 derivation path', () => {
        const mockRoot = {
            derive: jest.fn(() => ({ privateKey: mockPrivateKey }))
        };
        hdkey.fromMasterSeed.mockReturnValue(mockRoot);
        
        keysRecoverFromPhraseSecp256k1(mockMnemonic);
        
        expect(mockRoot.derive).toHaveBeenCalledWith("m/44'/223'/0'/0/0");
    });
});

describe('identityFromPrivate', () => {
    const mockPrivateKeyHex = '0123456789abcdef';
    const mockPrivateKeyBytes = new Uint8Array([1, 35, 69, 103, 137, 171, 205, 239]);
    const mockIdentity = {
        toJSON: jest.fn(() => ['publicKey', 'privateKey']),
        getPrincipal: jest.fn(() => ({
            toString: () => 'aaaaa-aa'
        }))
    };
    const mockAccount = {
        toHex: jest.fn(() => 'abc123def456')
    };

    beforeEach(() => {
        jest.clearAllMocks();
        hexStringToUint8Array.mockReturnValue(mockPrivateKeyBytes);
        Secp256k1KeyIdentity.fromSecretKey.mockReturnValue(mockIdentity);
        AccountIdentifier.fromPrincipal.mockReturnValue(mockAccount);
    });

    test('converts string hex to Uint8Array', () => {
        const result = identityFromPrivate(mockPrivateKeyHex);
        
        expect(hexStringToUint8Array).toHaveBeenCalledWith(mockPrivateKeyHex);
        expect(result).toEqual({
            identity: mockIdentity,
            principal: 'aaaaa-aa',
            account: 'abc123def456'
        });
    });

    test('handles Uint8Array input directly', () => {
        const result = identityFromPrivate(mockPrivateKeyBytes);
        
        expect(hexStringToUint8Array).not.toHaveBeenCalled();
        expect(Secp256k1KeyIdentity.fromSecretKey).toHaveBeenCalledWith(mockPrivateKeyBytes);
        expect(result).toEqual({
            identity: mockIdentity,
            principal: 'aaaaa-aa',
            account: 'abc123def456'
        });
    });
});

describe('encryptKey', () => {
    const mockPassword = 'testPassword123';
    const mockText = 'secretKey';
    const mockSalt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mockIv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const mockCiphertext = new ArrayBuffer(16);
    const mockKeyMaterial = {};
    const mockKey = {};

    beforeEach(() => {
        jest.clearAllMocks();
        mockCrypto.getRandomValues
            .mockReturnValueOnce(mockSalt)
            .mockReturnValueOnce(mockIv);
        mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
        mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext);
    });

    test('encrypts text with password', async () => {
        const result = await encryptKey(mockText, mockPassword);
        
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
            'raw',
            expect.any(Uint8Array),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
            {
                name: 'PBKDF2',
                salt: mockSalt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            mockKeyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
            { name: 'AES-GCM', iv: mockIv },
            mockKey,
            expect.any(Uint8Array)
        );
        expect(result).toEqual({
            ciphertext: mockCiphertext,
            iv: mockIv,
            salt: mockSalt
        });
    });

    test('returns object with ciphertext, iv, and salt', async () => {
        const result = await encryptKey(mockText, mockPassword);
        
        expect(result).toHaveProperty('ciphertext');
        expect(result).toHaveProperty('iv');
        expect(result).toHaveProperty('salt');
    });
});

describe('decryptKey', () => {
    const mockPassword = 'testPassword123';
    const mockEncryptedData = {
        ciphertext: new ArrayBuffer(16),
        iv: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    };
    const mockDecrypted = new TextEncoder().encode('secretKey');
    const mockKeyMaterial = {};
    const mockKey = {};

    beforeEach(() => {
        jest.clearAllMocks();
        mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
        mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.decrypt.mockResolvedValue(mockDecrypted);
    });

    test('decrypts encrypted data with password', async () => {
        const result = await decryptKey(mockEncryptedData, mockPassword);
        
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
            'raw',
            expect.any(Uint8Array),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
            {
                name: 'PBKDF2',
                salt: mockEncryptedData.salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            mockKeyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(
            { name: 'AES-GCM', iv: mockEncryptedData.iv },
            mockKey,
            mockEncryptedData.ciphertext
        );
        expect(result).toBe('secretKey');
    });

    test('returns decrypted text as string', async () => {
        const result = await decryptKey(mockEncryptedData, mockPassword);
        
        expect(typeof result).toBe('string');
    });
});

describe('serializeEncryptKey', () => {
    test('converts ArrayBuffers to base64 strings', () => {
        const mockKey = {
            ciphertext: new Uint8Array([1, 2, 3, 4]).buffer,
            iv: new Uint8Array([5, 6, 7, 8]).buffer,
            salt: new Uint8Array([9, 10, 11, 12]).buffer
        };
        
        const result = serializeEncryptKey(mockKey);
        
        expect(window.btoa).toHaveBeenCalledTimes(3);
        expect(typeof result.ciphertext).toBe('string');
        expect(typeof result.iv).toBe('string');
        expect(typeof result.salt).toBe('string');
    });

    test('produces valid base64 strings', () => {
        const mockKey = {
            ciphertext: new Uint8Array([65, 66, 67]).buffer,
            iv: new Uint8Array([68, 69, 70]).buffer,
            salt: new Uint8Array([71, 72, 73]).buffer
        };
        
        const result = serializeEncryptKey(mockKey);
        
        expect(result.ciphertext).toMatch(/^[A-Za-z0-9+/]+=*$/);
        expect(result.iv).toMatch(/^[A-Za-z0-9+/]+=*$/);
        expect(result.salt).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
});

describe('deserializeEncryptKey', () => {
    test('converts base64 strings to Uint8Arrays', () => {
        const mockKey = {
            ciphertext: 'AQIDBA==',
            iv: 'BQYHCA==',
            salt: 'CQoLDA=='
        };
        
        const result = deserializeEncryptKey(mockKey);
        
        expect(window.atob).toHaveBeenCalledTimes(3);
        expect(result.ciphertext).toBeInstanceOf(Uint8Array);
        expect(result.iv).toBeInstanceOf(Uint8Array);
        expect(result.salt).toBeInstanceOf(Uint8Array);
    });

    test('correctly decodes base64 data', () => {
        const mockKey = {
            ciphertext: Buffer.from([1, 2, 3, 4]).toString('base64'),
            iv: Buffer.from([5, 6, 7, 8]).toString('base64'),
            salt: Buffer.from([9, 10, 11, 12]).toString('base64')
        };
        
        const result = deserializeEncryptKey(mockKey);
        
        expect(Array.from(result.ciphertext)).toEqual([1, 2, 3, 4]);
        expect(Array.from(result.iv)).toEqual([5, 6, 7, 8]);
        expect(Array.from(result.salt)).toEqual([9, 10, 11, 12]);
    });
});

describe('Integration: Encrypt → Serialize → Deserialize → Decrypt', () => {
    test('round-trip encryption and decryption works correctly', async () => {
        const originalText = 'mySecretKey123';
        const password = 'strongPassword';
        
        // Setup mocks for full flow
        const mockSalt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        const mockIv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        const mockCiphertext = new TextEncoder().encode('encrypted').buffer;
        const mockKeyMaterial = {};
        const mockKey = {};
        
        mockCrypto.getRandomValues
            .mockReturnValueOnce(mockSalt)
            .mockReturnValueOnce(mockIv);
        mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
        mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
        mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext);
        mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode(originalText));
        
        // Encrypt
        const encrypted = await encryptKey(originalText, password);
        
        // Serialize
        const serialized = serializeEncryptKey(encrypted);
        
        // Deserialize
        const deserialized = deserializeEncryptKey(serialized);
        
        // Decrypt
        const decrypted = await decryptKey(deserialized, password);
        
        expect(decrypted).toBe(originalText);
    });
});