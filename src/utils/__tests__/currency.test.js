const {
    formatWithSpaces,
    formatCurrency,
    ICP2icpt,
    icpt2ICP
} = require('../currency.js');

describe('formatWithSpaces', () => {
    test('groups from left with 4 characters', () => {
        expect(formatWithSpaces('1234567890', 4, true)).toBe('1234 5678 90');
    });

    test('groups from right with 3 characters', () => {
        expect(formatWithSpaces('1234567890', 3, false)).toBe('1 234 567 890');
    });

    test('handles empty string', () => {
        expect(formatWithSpaces('', 3, false)).toBe('');
    });

    test('handles string shorter than group size', () => {
        expect(formatWithSpaces('12', 3, false)).toBe('12');
    });

    test('groups exactly divisible string from left', () => {
        expect(formatWithSpaces('123456', 3, true)).toBe('123 456');
    });

    test('groups exactly divisible string from right', () => {
        expect(formatWithSpaces('123456', 3, false)).toBe('123 456');
    });

    test('single character', () => {
        expect(formatWithSpaces('1', 3, false)).toBe('1');
    });
});

describe('formatCurrency', () => {
    test('formats integer with 2 decimals', () => {
        expect(formatCurrency(1234567, 2)).toBe('1 234 567.00');
    });

    test('formats decimal with 2 decimals', () => {
        expect(formatCurrency(1234.56, 2)).toBe('1 234.56');
    });

    test('formats with custom decimal places', () => {
        expect(formatCurrency(100.123456, 4)).toBe('100.1234..');
    });

    test('formats exactly with custom decimal places', () => {
        expect(formatCurrency(100.1234, 4)).toBe('100.1234');
    });

    test('pads fractional part with zeros', () => {
        expect(formatCurrency(100.1, 4)).toBe('100.1000');
    });

    test('adds suffix when has remainder after zeros', () => {
        expect(formatCurrency(100.0000001, 2)).toBe('100.00..');
    });

    test('does not add suffix when no remainder', () => {
        expect(formatCurrency(100.12, 2)).toBe('100.12');
    });

    test('handles very small numbers as zero', () => {
        expect(formatCurrency(0.0000001, 2)).toBe('0.00');
    });

    test('handles negative numbers', () => {
        expect(formatCurrency(-1234.56, 2)).toBe('-1 234.56');
    });

    test('handles zero', () => {
        expect(formatCurrency(0, 2)).toBe('0.00');
    });

    test('formats large numbers correctly', () => {
        expect(formatCurrency(1234567890.12, 2)).toBe('1 234 567 890.12');
    });

    test('truncates extra decimals', () => {
        expect(formatCurrency(100.12345, 2)).toBe('100.12..');
    });

    test('handles number with more decimals than displayed but non-zero', () => {
        expect(formatCurrency(100.1234, 2)).toBe('100.12..');
    });
});

describe('ICP2icpt', () => {
    test('converts integer amount with 8 decimals', () => {
        expect(ICP2icpt(1, 8)).toBe(100000000n);
    });

    test('converts decimal amount with 8 decimals', () => {
        expect(ICP2icpt(1.5, 8)).toBe(150000000n);
    });

    test('converts amount with full 8 decimals', () => {
        expect(ICP2icpt(1.12345678, 8)).toBe(112345678n);
    });

    test('converts zero', () => {
        expect(ICP2icpt(0, 8)).toBe(0n);
    });

    test('converts with custom decimals', () => {
        expect(ICP2icpt(1.23, 2)).toBe(123n);
    });

    test('converts string number', () => {
        expect(ICP2icpt('1.5', 8)).toBe(150000000n);
    });

    test('pads fractional part with zeros', () => {
        expect(ICP2icpt(1.1, 8)).toBe(110000000n);
    });

    test('throws error when too many decimals', () => {
        expect(() => ICP2icpt(1.123456789, 8)).toThrow('More than 8 decimals not supported.');
    });

    test('handles very small fractional amounts', () => {
        expect(ICP2icpt(0.00000001, 8)).toBe(1n);
    });

    test('handles large integer amounts', () => {
        expect(ICP2icpt(1000000, 8)).toBe(100000000000000n);
    });
});

describe('icpt2ICP', () => {
    test('converts integer tokens to ICP with 8 decimals', () => {
        expect(icpt2ICP(100000000n, 8)).toBe(1);
    });

    test('converts partial tokens to ICP', () => {
        expect(icpt2ICP(150000000n, 8)).toBe(1.5);
    });

    test('converts with custom decimals', () => {
        expect(icpt2ICP(123n, 2)).toBe(1.23);
    });

    test('converts zero', () => {
        expect(icpt2ICP(0n, 8)).toBe(0);
    });

    test('converts single token unit', () => {
        expect(icpt2ICP(1n, 8)).toBe(0.00000001);
    });

    test('handles large amounts', () => {
        expect(icpt2ICP(100000000000000n, 8)).toBe(1000000);
    });

    test('converts number input', () => {
        expect(icpt2ICP(100000000, 8)).toBe(1);
    });

    test('handles fractional result correctly', () => {
        expect(icpt2ICP(112345678n, 8)).toBe(1.12345678);
    });
});