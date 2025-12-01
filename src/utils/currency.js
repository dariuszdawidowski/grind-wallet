/*** Currency helpers ***/


/**
 * Group number to blocks separated by spaces e.g. 0000 0000 0000
 * @param {string} inputString - string to format
 * @param {number} everyNCharacters - group size
 * @param {boolean} fromLeft - direction of grouping
 * @returns {string} - formatted string
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
 * Display number as human-readable currency formatted with spaces and fixed decimals, also .. suffix
 * @param {number} value - value to format
 * @param {number} fixed - number of decimal places to show
 * @returns {string} - formatted currency string
 */

export function formatCurrency(value, fixed = 2) {
    let wasCutted = false;
    if (Math.abs(value) < 1e-6) {
        value = 0;
        wasCutted = true;
    }
    const [whole, fractional = ''] = value.toString().split('.');
    const displayedFraction = fractional.slice(0, fixed).padEnd(fixed, '0');
    const hasRemainder = fractional.length > fixed;
    const suffix = hasRemainder || wasCutted ? '..' : '';
    return formatWithSpaces(whole, 3, false) + '.' + displayedFraction + suffix;
}


/**
 * ICP -> ICPt
 * @param {number|string} amount - amount in ICP
 * @param {number} decimals - number of decimal places (default 8 for ICP)
 * @returns {bigint} - amount in ICPt
 */

export function ICP2icpt(amount, decimals = 8) {
    // Validate decimal places before conversion
    const amountStr = amount.toString();
    const [, fractional] = amountStr.split('.');
    
    if (fractional && fractional.length > decimals) {
        throw new Error(`More than ${decimals} decimals not supported.`);
    }

    // Convert to fixed notation to avoid scientific notation (1e-8)
    const fixedStr = Number(amount).toFixed(decimals);
    const [integral, fractionalPart] = fixedStr.split('.');

    return (
        BigInt(integral ?? 0) * BigInt(10 ** decimals) +
        BigInt((fractionalPart ?? '0').padEnd(decimals, '0'))
    );
};


/**
 * ICPt -> ICP
 * @param {number|string|bigint} amount - amount in ICPt
 * @param {number} decimals - number of decimal places (default 8 for ICP)
 * @returns {number} - amount in ICP
 */

export function icpt2ICP(amount, decimals = 8) {
    return Number(amount) / (10 ** decimals);
}
