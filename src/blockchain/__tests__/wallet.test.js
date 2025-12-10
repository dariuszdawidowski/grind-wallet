import { Wallet } from '../wallet.js';

// Mock dependencies
jest.mock('../tokens.js', () => ({
    Tokens: jest.fn().mockImplementation(() => ({
        serialize: jest.fn(() => ({}))
    }))
}));

jest.mock('../nfts.js', () => ({
    NFTs: jest.fn().mockImplementation(() => ({
        serialize: jest.fn(() => ({}))
    }))
}));

describe('Wallet', () => {
    const mockApp = {};
    
    describe('constructor with encrypted mnemonic', () => {
        test('stores secret with nested private and mnemonic fields', () => {
            const secretWithMnemonic = {
                private: {
                    ciphertext: 'encryptedPrivateKey',
                    iv: 'ivValue',
                    salt: 'saltValue'
                },
                mnemonic: {
                    ciphertext: 'encryptedMnemonic',
                    iv: 'mnemonicIv',
                    salt: 'mnemonicSalt'
                }
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretWithMnemonic,
                tokens: {},
                nfts: {}
            });
            
            expect(wallet.secret).toEqual(secretWithMnemonic);
            expect(wallet.secret.private).toBeDefined();
            expect(wallet.secret.mnemonic).toBeDefined();
            expect(wallet.secret.mnemonic.ciphertext).toBe('encryptedMnemonic');
        });
        
        test('works with old flat structure for backward compatibility', () => {
            const secretOldFormat = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue'
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretOldFormat,
                tokens: {},
                nfts: {}
            });
            
            expect(wallet.secret).toEqual(secretOldFormat);
            expect(wallet.secret.ciphertext).toBe('encryptedPrivateKey');
        });
    });
    
    describe('serialize', () => {
        test('includes nested private and mnemonic in serialized secret', () => {
            const secretWithMnemonic = {
                private: {
                    ciphertext: 'encryptedPrivateKey',
                    iv: 'ivValue',
                    salt: 'saltValue'
                },
                mnemonic: {
                    ciphertext: 'encryptedMnemonic',
                    iv: 'mnemonicIv',
                    salt: 'mnemonicSalt'
                }
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretWithMnemonic,
                tokens: {},
                nfts: {}
            });
            
            const serialized = wallet.serialize();
            
            expect(serialized.secret).toEqual(secretWithMnemonic);
            expect(serialized.secret.private).toBeDefined();
            expect(serialized.secret.mnemonic).toBeDefined();
        });
        
        test('serializes wallet with old format correctly', () => {
            const secretOldFormat = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue'
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretOldFormat,
                tokens: {},
                nfts: {}
            });
            
            const serialized = wallet.serialize();
            
            expect(serialized.secret).toEqual(secretOldFormat);
            expect(serialized.secret.private).toBeUndefined();
        });
    });
});
