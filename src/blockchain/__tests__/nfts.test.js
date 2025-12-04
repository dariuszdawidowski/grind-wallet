// Mock NFT to avoid deep dependencies
jest.mock('/src/blockchain/nft.js', () => ({
    NFT: jest.fn()
}));

import { NFTs } from '../nfts.js';

// Mock NFT objects based on requirements
const mockNFT1 = {
    collection: 'collection1',
    id: 'nft1',
    thumbnail: 'https://example.com/nft1.jpg',
    standard: 'EXT',
    build: jest.fn()
};

const mockNFT2 = {
    collection: 'collection1',
    id: 'nft2',
    thumbnail: 'https://example.com/nft2.jpg',
    standard: 'ICRC-7',
    build: jest.fn()
};

const mockNFT3 = {
    collection: 'collection2',
    id: 'nft1',
    thumbnail: 'https://example.com/nft3.jpg',
    standard: 'EXT',
    build: jest.fn()
};

// Mock app and wallet objects
const mockApp = {
    cache: {
        ram: {}
    }
};

const mockWallet = {
    agent: {},
    principal: 'qio7v-m7jbv-huagd-pd6l4-s7x2z-wg73b-ltj44-2h42x-23qfx-ryouz-hae'
};

describe('NFTs', () => {
    let nfts;

    beforeEach(() => {
        nfts = new NFTs({ app: mockApp, wallet: mockWallet });
    });

    describe('constructor', () => {
        test('initializes with empty list', () => {
            expect(nfts.list).toEqual({});
        });

        test('stores app reference', () => {
            expect(nfts.app).toBe(mockApp);
        });

        test('stores wallet reference', () => {
            expect(nfts.wallet).toBe(mockWallet);
        });

        test('initializes with provided NFTs', () => {
            const existingNFTs = {
                'collection1:nft1': mockNFT1
            };
            const nftsWithData = new NFTs({ app: mockApp, wallet: mockWallet, nfts: existingNFTs });
            expect(nftsWithData.list).toBe(existingNFTs);
        });
    });

    describe('add', () => {
        test('adds NFT to the collection with correct key', () => {
            nfts.add(mockNFT1);
            expect(nfts.list['collection1:nft1']).toBe(mockNFT1);
        });

        test('adds multiple NFTs to the collection', () => {
            nfts.add(mockNFT1);
            nfts.add(mockNFT2);
            nfts.add(mockNFT3);
            expect(nfts.list['collection1:nft1']).toBe(mockNFT1);
            expect(nfts.list['collection1:nft2']).toBe(mockNFT2);
            expect(nfts.list['collection2:nft1']).toBe(mockNFT3);
        });

        test('overwrites NFT with same collection and ID', () => {
            const updatedNFT1 = { ...mockNFT1, thumbnail: 'https://example.com/updated.jpg' };
            nfts.add(mockNFT1);
            nfts.add(updatedNFT1);
            expect(nfts.list['collection1:nft1']).toBe(updatedNFT1);
            expect(nfts.list['collection1:nft1'].thumbnail).toBe('https://example.com/updated.jpg');
        });
    });

    describe('del', () => {
        test('removes NFT from the collection', () => {
            nfts.add(mockNFT1);
            nfts.del('collection1:nft1');
            expect(nfts.list['collection1:nft1']).toBeUndefined();
        });

        test('does not affect other NFTs when deleting', () => {
            nfts.add(mockNFT1);
            nfts.add(mockNFT2);
            nfts.del('collection1:nft1');
            expect(nfts.list['collection1:nft1']).toBeUndefined();
            expect(nfts.list['collection1:nft2']).toBe(mockNFT2);
        });

        test('handles deleting non-existent NFT', () => {
            expect(() => nfts.del('non-existent:nft')).not.toThrow();
            expect(nfts.list['non-existent:nft']).toBeUndefined();
        });
    });

    describe('get', () => {
        beforeEach(() => {
            nfts.add(mockNFT1);
            nfts.add(mockNFT2);
            nfts.add(mockNFT3);
        });

        test('returns all NFTs when no parameters provided', () => {
            const allNFTs = nfts.get();
            expect(allNFTs).toBe(nfts.list);
            expect(Object.keys(allNFTs)).toHaveLength(3);
        });

        test('returns specific NFT by composite key', () => {
            const nft = nfts.get('collection1:nft1');
            expect(nft).toBe(mockNFT1);
        });

        test('returns specific NFT by separate collectionId and nftId', () => {
            const nft = nfts.get('collection1', 'nft2');
            expect(nft).toBe(mockNFT2);
        });

        test('returns null for non-existent composite key', () => {
            const nft = nfts.get('non-existent:nft');
            expect(nft).toBeUndefined();
        });

        test('returns null for non-existent collection and NFT ID', () => {
            const nft = nfts.get('non-existent', 'nft');
            expect(nft).toBeUndefined();
        });
    });

    describe('count', () => {
        test('returns 0 for empty collection', () => {
            expect(nfts.count()).toBe(0);
        });

        test('returns correct count after adding NFTs', () => {
            nfts.add(mockNFT1);
            expect(nfts.count()).toBe(1);
            nfts.add(mockNFT2);
            expect(nfts.count()).toBe(2);
            nfts.add(mockNFT3);
            expect(nfts.count()).toBe(3);
        });

        test('returns correct count after removing NFT', () => {
            nfts.add(mockNFT1);
            nfts.add(mockNFT2);
            nfts.del('collection1:nft1');
            expect(nfts.count()).toBe(1);
        });

        test('returns correct count after adding duplicate key', () => {
            nfts.add(mockNFT1);
            nfts.add({ ...mockNFT1, thumbnail: 'updated' });
            expect(nfts.count()).toBe(1);
        });
    });

    describe('load', () => {
        test('loads serialized NFTs into collection', () => {
            const serialized = {
                'collection1:nft1': {
                    id: 'nft1',
                    standard: 'EXT',
                    collection: 'collection1',
                    thumbnail: 'https://example.com/nft1.jpg'
                },
                'collection1:nft2': {
                    id: 'nft2',
                    standard: 'ICRC-7',
                    collection: 'collection1',
                    thumbnail: 'https://example.com/nft2.jpg'
                }
            };

            const NFT = require('/src/blockchain/nft.js').NFT;
            const mockNFTInstance1 = { 
                id: 'nft1',
                collection: 'collection1',
                build: jest.fn() 
            };
            const mockNFTInstance2 = { 
                id: 'nft2',
                collection: 'collection1',
                build: jest.fn() 
            };
            NFT.mockReturnValueOnce(mockNFTInstance1).mockReturnValueOnce(mockNFTInstance2);

            nfts.load(serialized);

            expect(NFT).toHaveBeenCalledTimes(2);
            expect(NFT).toHaveBeenCalledWith({
                app: mockApp,
                wallet: mockWallet,
                id: 'nft1',
                standard: 'EXT',
                collection: 'collection1',
                thumbnail: 'https://example.com/nft1.jpg'
            });
            expect(mockNFTInstance1.build).toHaveBeenCalledWith({ agent: mockWallet.agent });
            expect(mockNFTInstance2.build).toHaveBeenCalledWith({ agent: mockWallet.agent });
            expect(nfts.count()).toBe(2);
        });

        test('handles empty serialized object', () => {
            expect(() => nfts.load({})).not.toThrow();
            expect(nfts.count()).toBe(0);
        });
    });

    describe('serialize', () => {
        test('returns empty object for empty collection', () => {
            const serialized = nfts.serialize();
            expect(serialized).toEqual({});
        });

        test('serializes NFTs with correct structure', () => {
            nfts.add(mockNFT1);
            nfts.add(mockNFT2);

            const serialized = nfts.serialize();

            expect(serialized).toEqual({
                'collection1:nft1': {
                    id: 'nft1',
                    standard: 'EXT',
                    collection: 'collection1',
                    thumbnail: 'https://example.com/nft1.jpg'
                },
                'collection1:nft2': {
                    id: 'nft2',
                    standard: 'ICRC-7',
                    collection: 'collection1',
                    thumbnail: 'https://example.com/nft2.jpg'
                }
            });
        });

        test('serializes only required fields', () => {
            const nftWithExtraFields = {
                collection: 'collection1',
                id: 'nft1',
                thumbnail: 'https://example.com/nft1.jpg',
                standard: 'EXT',
                extraField: 'should not be serialized',
                build: jest.fn()
            };

            nfts.add(nftWithExtraFields);
            const serialized = nfts.serialize();

            expect(serialized['collection1:nft1']).toEqual({
                id: 'nft1',
                standard: 'EXT',
                collection: 'collection1',
                thumbnail: 'https://example.com/nft1.jpg'
            });
            expect(serialized['collection1:nft1'].extraField).toBeUndefined();
            expect(serialized['collection1:nft1'].build).toBeUndefined();
        });
    });
});
