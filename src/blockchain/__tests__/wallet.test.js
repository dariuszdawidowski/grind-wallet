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
        test('stores secret with mnemonic field', () => {
            const secretWithMnemonic = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue',
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
            expect(wallet.secret.mnemonic).toBeDefined();
            expect(wallet.secret.mnemonic.ciphertext).toBe('encryptedMnemonic');
        });
        
        test('works without mnemonic field for backward compatibility', () => {
            const secretWithoutMnemonic = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue'
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretWithoutMnemonic,
                tokens: {},
                nfts: {}
            });
            
            expect(wallet.secret).toEqual(secretWithoutMnemonic);
            expect(wallet.secret.mnemonic).toBeUndefined();
        });
    });
    
    describe('serialize', () => {
        test('includes mnemonic in serialized secret', () => {
            const secretWithMnemonic = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue',
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
            expect(serialized.secret.mnemonic).toBeDefined();
        });
        
        test('serializes wallet without mnemonic correctly', () => {
            const secretWithoutMnemonic = {
                ciphertext: 'encryptedPrivateKey',
                iv: 'ivValue',
                salt: 'saltValue'
            };
            
            const wallet = new Wallet({
                app: mockApp,
                blockchain: 'Internet Computer',
                name: 'Test Wallet',
                publicKey: 'testPublicKey',
                secret: secretWithoutMnemonic,
                tokens: {},
                nfts: {}
            });
            
            const serialized = wallet.serialize();
            
            expect(serialized.secret).toEqual(secretWithoutMnemonic);
            expect(serialized.secret.mnemonic).toBeUndefined();
        });
    });
});
