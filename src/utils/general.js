/*** Constant definitions ***/

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

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
    if (!address || address.length < 10) return address;
    if (address.includes('-')) return shortPrincipalId(address);
    return shortAccountId(address);
}

/**
 * Convert timestamp in nanoseconds to ISO datetime string.
 *
 * @param {bigint} timestampNanos - The timestamp in nanoseconds.
 * @returns {string} The ISO datetime string.
 */

export function timestampNanos2ISO(timestampNanos) {
    const ms = Number(BigInt(timestampNanos) / 1000000n);
    return new Date(ms).toISOString();
}

/**
 * Generates hash of given buffer using SHA-256 algorithm.
 *
 * @param {ArrayBuffer} buffer - The input buffer to hash.
 * @returns {Promise<string>} The hexadecimal representation of the hash.
 */

export async function hashBuffer(buffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates hash of given string using SHA-256 algorithm.
 *
 * @param {string} str - The input string to hash.
 * @returns {Promise<string>} The hexadecimal representation of the hash.
 */

export async function hashString(str) {
    const buffer = new TextEncoder().encode(str);
    return await hashBuffer(buffer);
}
