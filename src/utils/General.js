/*** General helpers ***/

/**
 * Convert a memo to a binary format.
 *
 * @param {number} memo - The memo to be converted.
 * @returns {Uint8Array} The memo in binary format.
 */

export function memo2Binary(memo) {
    const MAX_UINT32 = 0xFFFFFFFF;
    memo = memo % (MAX_UINT32 + 1);
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, memo, true);
    return new Uint8Array(buffer);
}

/**
 * Check if a given string is a valid Canister ID.
 *
 * @param {string} canisterId - The string to be checked.
 * @returns {boolean} True if the string is valid, false otherwise.
 */

export function isValidCanisterId(canisterId) {
    const canisterIdRegex = /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    return canisterIdRegex.test(canisterId);
}

/**
 * Format Principal ID to a shorter version for display.
 *
 * @param {string} principalId - The Principal ID to be formatted.
 * @returns {string} The formatted Principal ID.
 */

export function shortPrincipalId(principalId) {
    const parts = principalId.split('-');
    if (parts.length < 2) {
        return principalId;
    }
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first}...${last}`;
}

/**
 * Format Account ID to a shorter version for display.
 *
 * @param {string} accountId - The Account ID to be formatted.
 * @returns {string} The formatted Account ID.
 */

export function shortAccountId(accountId) {
    const first = accountId.slice(0, 4);
    const last = accountId.slice(-4);
    return `${first}...${last}`;
}

/**
 * Detect PrincipalId or Account ID to a shorter version for display.
 *
 * @param {string} principalId/accountId - The Account ID to be formatted.
 * @returns {string} The formatted Account ID.
 */

export function shortAddress(address) {
    if (address.includes('-')) return shortPrincipalId(address);
    return shortAccountId(address);
}
