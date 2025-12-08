// Mock for @dfinity/utils

const hexStringToUint8Array = jest.fn((hex) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
});

module.exports = {
    hexStringToUint8Array
};
