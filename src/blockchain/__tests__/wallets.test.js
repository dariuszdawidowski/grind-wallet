// Mock browser module before importing Wallets
jest.mock('/src/utils/browser.js', () => require('../../__mocks__/browser.js'));

// Mock ICPWallet to avoid deep dependencies
jest.mock('/src/blockchain/InternetComputer/wallet-icp.js', () => ({
    ICPWallet: jest.fn()
}));

import { Wallets } from '../wallets.js';

// Mock wallet objects based on requirements
const mockWallet1 = {
    name: 'DEV #1',
    public: '0423fc230bc96b88e2b2160266fbb9b2198e89b8088fc23ec1f7909a3c649ba1d129e7ca619a5742d12586bba028a1f7e48312f268dffbe714b9ac887b57f44cec',
    principal: 'qio7v-m7jbv-huagd-pd6l4-s7x2z-wg73b-ltj44-2h42x-23qfx-ryouz-hae',
    account: '646de1a56f94f85a08d01b63a55e8871b86b0014adb76abc78c5f5d29c0f6edf'
};

const mockWallet2 = {
    name: 'DEV #2',
    public: '04613c794416aa566e4a95e40a266617c41e74e3719da6f30e525a6e9df06e34a88da8a98861d2d597e58bf4532d8593856fb72bb819e65668a517d347f66c0b05',
    principal: 'udb3f-hgkk3-3csng-n56yz-bd5nx-v223k-4mas2-pumih-cpoed-ueshl-6qe',
    account: 'b0853272f56c83ba64d67a6affbfeb5be4e348462ec393949e9e6bac9922e05f'
};

// Mock app object
const mockApp = {
    session: {},
    storage: {}
};

describe('Wallets', () => {
    let wallets;

    beforeEach(() => {
        wallets = new Wallets({ app: mockApp });
    });

    describe('constructor', () => {
        test('initializes with empty list', () => {
            expect(wallets.list).toEqual({});
        });

        test('stores app reference', () => {
            expect(wallets.app).toBe(mockApp);
        });
    });

    describe('add', () => {
        test('adds wallet to the collection', () => {
            wallets.add(mockWallet1);
            expect(wallets.list[mockWallet1.public]).toBe(mockWallet1);
        });

        test('adds multiple wallets to the collection', () => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
            expect(wallets.list[mockWallet1.public]).toBe(mockWallet1);
            expect(wallets.list[mockWallet2.public]).toBe(mockWallet2);
        });

        test('overwrites wallet with same public key', () => {
            const updatedWallet1 = { ...mockWallet1, name: 'Updated DEV #1' };
            wallets.add(mockWallet1);
            wallets.add(updatedWallet1);
            expect(wallets.list[mockWallet1.public]).toBe(updatedWallet1);
            expect(wallets.list[mockWallet1.public].name).toBe('Updated DEV #1');
        });
    });

    describe('del', () => {
        test('removes wallet from the collection', () => {
            wallets.add(mockWallet1);
            wallets.del(mockWallet1.public);
            expect(wallets.list[mockWallet1.public]).toBeUndefined();
        });

        test('does not affect other wallets when deleting', () => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
            wallets.del(mockWallet1.public);
            expect(wallets.list[mockWallet1.public]).toBeUndefined();
            expect(wallets.list[mockWallet2.public]).toBe(mockWallet2);
        });

        test('handles deleting non-existent wallet', () => {
            expect(() => wallets.del('non-existent')).not.toThrow();
            expect(wallets.list['non-existent']).toBeUndefined();
        });
    });

    describe('get', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns specific wallet by public key', () => {
            const wallet = wallets.get(mockWallet1.public);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns all wallets when no public key provided', () => {
            const allWallets = wallets.get();
            expect(allWallets).toHaveLength(2);
            expect(allWallets).toContain(mockWallet1);
            expect(allWallets).toContain(mockWallet2);
        });

        test('returns undefined for non-existent public key', () => {
            const wallet = wallets.get('non-existent');
            expect(wallet).toBeUndefined();
        });

        test('returns empty array when no wallets exist', () => {
            const emptyWallets = new Wallets({ app: mockApp });
            const allWallets = emptyWallets.get();
            expect(allWallets).toEqual([]);
        });
    });

    describe('getByPrincipal', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns wallet by principal ID', () => {
            const wallet = wallets.getByPrincipal(mockWallet1.principal);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns null for non-existent principal', () => {
            const wallet = wallets.getByPrincipal('non-existent-principal');
            expect(wallet).toBeNull();
        });

        test('returns correct wallet among multiple wallets', () => {
            const wallet = wallets.getByPrincipal(mockWallet2.principal);
            expect(wallet).toBe(mockWallet2);
            expect(wallet.name).toBe('DEV #2');
        });
    });

    describe('getByAccount', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns wallet by account ID', () => {
            const wallet = wallets.getByAccount(mockWallet1.account);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns null for non-existent account', () => {
            const wallet = wallets.getByAccount('non-existent-account');
            expect(wallet).toBeNull();
        });

        test('returns correct wallet among multiple wallets', () => {
            const wallet = wallets.getByAccount(mockWallet2.account);
            expect(wallet).toBe(mockWallet2);
            expect(wallet.name).toBe('DEV #2');
        });
    });

    describe('getByPrincipalOrAccount', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns wallet by principal ID', () => {
            const wallet = wallets.getByPrincipalOrAccount(mockWallet1.principal, null);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns wallet by account ID', () => {
            const wallet = wallets.getByPrincipalOrAccount(null, mockWallet1.account);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns wallet when both principal and account match', () => {
            const wallet = wallets.getByPrincipalOrAccount(mockWallet1.principal, mockWallet1.account);
            expect(wallet).toBe(mockWallet1);
        });

        test('returns wallet when principal matches but account does not', () => {
            const wallet = wallets.getByPrincipalOrAccount(mockWallet1.principal, 'wrong-account');
            expect(wallet).toBe(mockWallet1);
        });

        test('returns wallet when account matches but principal does not', () => {
            const wallet = wallets.getByPrincipalOrAccount('wrong-principal', mockWallet2.account);
            expect(wallet).toBe(mockWallet2);
        });

        test('returns null when neither principal nor account match', () => {
            const wallet = wallets.getByPrincipalOrAccount('wrong-principal', 'wrong-account');
            expect(wallet).toBeNull();
        });
    });

    describe('count', () => {
        test('returns 0 for empty collection', () => {
            expect(wallets.count()).toBe(0);
        });

        test('returns correct count after adding wallets', () => {
            wallets.add(mockWallet1);
            expect(wallets.count()).toBe(1);
            wallets.add(mockWallet2);
            expect(wallets.count()).toBe(2);
        });

        test('returns correct count after removing wallet', () => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
            wallets.del(mockWallet1.public);
            expect(wallets.count()).toBe(1);
        });

        test('returns correct count after adding duplicate public key', () => {
            wallets.add(mockWallet1);
            wallets.add({ ...mockWallet1, name: 'Updated' });
            expect(wallets.count()).toBe(1);
        });
    });

    describe('genNextWalletName', () => {
        test('generates name for first wallet', () => {
            const name = wallets.genNextWalletName('ICP');
            expect(name).toBe('ICP #1');
        });

        test('generates name based on existing wallet count', () => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
            const name = wallets.genNextWalletName('ICP');
            expect(name).toBe('ICP #3');
        });

        test('generates name with different crypto parameter', () => {
            wallets.add(mockWallet1);
            const name = wallets.genNextWalletName('Bitcoin');
            expect(name).toBe('Bitcoin #2');
        });
    });

    describe('hasWallet', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns true when wallet with principal exists', () => {
            expect(wallets.hasWallet(mockWallet1.principal)).toBe(true);
        });

        test('returns false when wallet with principal does not exist', () => {
            expect(wallets.hasWallet('non-existent-principal')).toBe(false);
        });

        test('checks all wallets in collection', () => {
            expect(wallets.hasWallet(mockWallet2.principal)).toBe(true);
        });
    });

    describe('hasSimilarPrincipal', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns true when similar principal exists (first 4 chars match)', () => {
            const similarPrincipal = 'qio7v-xxxxx-xxxxx-xxxxx-xxx';
            expect(wallets.hasSimilarPrincipal(similarPrincipal)).toBe(true);
        });

        test('returns false when no similar principal exists', () => {
            const differentPrincipal = 'zzzzz-xxxxx-xxxxx-xxxxx-xxx';
            expect(wallets.hasSimilarPrincipal(differentPrincipal)).toBe(false);
        });

        test('checks all wallets for similarity', () => {
            const similarToWallet2 = 'udb3f-xxxxx-xxxxx-xxxxx-xxx';
            expect(wallets.hasSimilarPrincipal(similarToWallet2)).toBe(true);
        });

        test('returns true when exact match exists', () => {
            expect(wallets.hasSimilarPrincipal(mockWallet1.principal)).toBe(true);
        });

        describe('wallet poisoning attack examples', () => {
            test('detects attack with similar prefix (mockWallet1: qio7v-...)', () => {
                // Real: qio7v-m7jbv-huagd-pd6l4-s7x2z-wg73b-ltj44-2h42x-23qfx-ryouz-hae
                // Attack: same prefix, different suffix
                const attackPrincipal = 'qio7v-aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii-jjj';
                expect(wallets.hasSimilarPrincipal(attackPrincipal)).toBe(true);
            });

            test('detects attack with similar suffix (mockWallet1: ...-hae)', () => {
                // Real: qio7v-m7jbv-huagd-pd6l4-s7x2z-wg73b-ltj44-2h42x-23qfx-ryouz-hae
                // Attack: different prefix, same suffix
                const attackPrincipal = 'zzzzz-aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii-hae';
                expect(wallets.hasSimilarPrincipal(attackPrincipal)).toBe(true);
            });

            test('detects attack with visually similar characters in prefix (0/O, 1/I/l)', () => {
                // Real: qio7v-... (contains 'o' and '7')
                // Attack: qi07v with 0 instead of o
                const attackPrincipal = 'qi07v-aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii-zzz';
                expect(wallets.hasSimilarPrincipal(attackPrincipal)).toBe(true);
            });

            test('detects attack with visually similar characters in suffix', () => {
                // Real: ...-hae (contains 'h' and 'a')
                // Attack: same normalized suffix
                const attackPrincipal = 'zzzzz-aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii-hae';
                expect(wallets.hasSimilarPrincipal(attackPrincipal)).toBe(true);
            });

            test('does not flag completely different addresses', () => {
                const differentPrincipal = 'aaaaa-bbbbb-ccccc-ddddd-eeeee-fffff-ggggg-hhhhh-iiiii-jjjjj-kkk';
                expect(wallets.hasSimilarPrincipal(differentPrincipal)).toBe(false);
            });
        });
    });

    describe('hasSimilarAccount', () => {
        beforeEach(() => {
            wallets.add(mockWallet1);
            wallets.add(mockWallet2);
        });

        test('returns true when similar account exists (first 4 chars match)', () => {
            const similarAccount = '646dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
            expect(wallets.hasSimilarAccount(similarAccount)).toBe(true);
        });

        test('returns false when no similar account exists', () => {
            const differentAccount = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
            expect(wallets.hasSimilarAccount(differentAccount)).toBe(false);
        });

        test('checks all wallets for similarity', () => {
            const similarToWallet2 = 'b085xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
            expect(wallets.hasSimilarAccount(similarToWallet2)).toBe(true);
        });

        test('returns true when exact match exists', () => {
            expect(wallets.hasSimilarAccount(mockWallet1.account)).toBe(true);
        });

        describe('wallet poisoning attack examples', () => {
            test('detects attack with similar prefix (mockWallet1: 646d...)', () => {
                // Real: 646de1a56f94f85a08d01b63a55e8871b86b0014adb76abc78c5f5d29c0f6edf
                // Attack: same prefix, different suffix
                const attackAccount = '646daaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooopppp';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('detects attack with similar suffix (mockWallet1: ...6edf)', () => {
                // Real: 646de1a56f94f85a08d01b63a55e8871b86b0014adb76abc78c5f5d29c0f6edf
                // Attack: different prefix, same suffix
                const attackAccount = 'aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnooopp6edf';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('detects attack with visually similar characters in prefix (6/G)', () => {
                // Real: 646d... (contains '6' and 'd')
                // Attack: G46d with G instead of 6
                const attackAccount = 'G46daaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnooooqqqq';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('detects attack with visually similar characters in suffix (e/E)', () => {
                // Real: ...6edf
                // Attack: 6Edf with capital E
                const attackAccount = 'aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnooopp6Edf';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('detects attack on mockWallet2 with prefix (b085...)', () => {
                // Real: b0853272f56c83ba64d67a6affbfeb5be4e348462ec393949e9e6bac9922e05f
                // Attack: same prefix, different suffix
                const attackAccount = 'b085aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooopppp';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('detects attack on mockWallet2 with suffix (...e05f)', () => {
                // Real: b0853272f56c83ba64d67a6affbfeb5be4e348462ec393949e9e6bac9922e05f
                // Attack: different prefix, same suffix
                const attackAccount = 'aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooppe05f';
                expect(wallets.hasSimilarAccount(attackAccount)).toBe(true);
            });

            test('does not flag completely different addresses', () => {
                const differentAccount = 'aaaabbbbccccddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnnooooppppqqqq';
                expect(wallets.hasSimilarAccount(differentAccount)).toBe(false);
            });
        });
    });
});
