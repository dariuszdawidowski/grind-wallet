// Mock for @icp-sdk/canisters/ledger/icp

const AccountIdentifier = {
    fromPrincipal: jest.fn(() => ({
        toHex: jest.fn(() => 'mocked-account-id')
    }))
};

module.exports = {
    AccountIdentifier
};
