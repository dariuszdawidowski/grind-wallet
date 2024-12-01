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
    if (Math.abs(value) < 1e-6) value = 0;
    const [whole, fractional = ''] = value.toString().split('.');
    const displayedFraction = fractional.slice(0, fixed).padEnd(fixed, '0');
    const hasRemainder = fractional.length > fixed;
    const allZeros = displayedFraction.split('').every(char => char === '0');
    const suffix = hasRemainder && allZeros ? '..' : '';
    return formatWithSpaces(whole, 3, false) + '.' + displayedFraction + suffix;
}


/**
 * ICP -> icpt
 */

export function ICP2icpt(amount, decimals = 8) {
    const [integral, fractional] = `${amount}`.split('.');

    if ((fractional ?? '0').length > decimals) {
        throw new Error(`More than ${decimals} decimals not supported.`);
    }

    return (
        BigInt(integral ?? 0) * BigInt(10 ** decimals) +
        BigInt((fractional ?? '0').padEnd(decimals, '0'))
    );
};


/**
 * icpt -> ICP
 */

export function icpt2ICP(amount, decimals = 8) {
    return Number(amount) / (10 ** decimals);
}

/**
 * Validata ICRC-1 metadata
 * metadata: dictionary
 */

export function validICRC1(metadata) {
    if (('icrc1:name' in metadata) && ('Text' in metadata['icrc1:name']) &&
        ('icrc1:symbol' in metadata) && ('Text' in metadata['icrc1:symbol']) &&
        ('icrc1:decimals' in metadata) && ('Nat' in metadata['icrc1:decimals']) &&
        ('icrc1:fee' in metadata) && ('Nat' in metadata['icrc1:fee'])) return true;
    return false;
}
