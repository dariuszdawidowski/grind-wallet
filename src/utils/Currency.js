/*** Currency helpers ***/


/**
 * Group number to blocks separated by spaces e.g. 0000 0000 0000
 */

export function formatWithSpaces(inputString, everyNCharacters, fromLeft = true) {
    let result = '';

    if (fromLeft) {
        for (let i = 0; i < inputString.length; i++) {
            result += inputString[i];

            if ((i + 1) % everyNCharacters === 0 && i !== inputString.length - 1) {
                result += ' ';
            }
        }
    } else {
        for (let i = inputString.length - 1, j = 1; i >= 0; i--, j++) {
            result = inputString[i] + result;

            if (j % everyNCharacters === 0 && i !== 0) {
                result = ' ' + result;
            }
        }
    }

    return result;
}


/**
 * Display number as currency
 */

export function formatCurrency(value, fixed = 2) {
    const s = value.toFixed(fixed).toString()
    const [whole, fractional] = s.split('.');
    return formatWithSpaces(whole, 3, false) + '.' + fractional;
}


/**
 * Format 8-precision int as float
 */

export function formatE8S(e8s) {
    return Number(e8s) / 1e8;
}


/**
 * Convert Number ICP to BigInt ICPt
 */

const E8S_PER_ICP = BigInt(100000000);

export const ICP2ICPt = (amount) => {
    const [integral, fractional] = `${amount}`.split('.');

    if ((fractional ?? '0').length > 8) {
        throw new Error('More than 8 decimals not supported.');
    }

    return (
        BigInt(integral ?? 0) * E8S_PER_ICP +
        BigInt((fractional ?? '0').padEnd(8, '0'))
    );
};
