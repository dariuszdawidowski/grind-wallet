/*** General helpers ***/


/**
 * Generate a wallet name based on the number of existing wallets and the specified cryptocurrency.
 *
 * @param {Object} wallets - A reference to the existing wallets.
 * @param {string} crypto - The blockchain or cryptocurrency type.
 * @returns {string} The generated wallet name.
 */

export function genWalletName(wallets, crypto) {

    return `${crypto} #${Object.keys(wallets).length + 1}`;
}


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