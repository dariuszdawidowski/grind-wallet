/*** Password helpers ***/


/**
 * Check password with at least 8 characters long and a mix of uppercase and lowercase letters, numbers, and special characters.
 */

export function isPasswordStrong(password) {
    const minLength = 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= minLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar) {
        return true;
    } else {
        return false;
    }
}


/**
 * Hash given password string
 */

export async function generateSalt(length = 16) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => String.fromCharCode(b)).join('');
}


/**
 * Hash given password string
 */

export async function hashPassword(password, salt, iterations = 100000) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: iterations,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );

    return Array.from(new Uint8Array(hashBuffer)).map(b => String.fromCharCode(b)).join('');
}


/**
 * Verify password with given salt and string
 */

export async function verifyPassword(password, salt, hash, iterations = 100000) {
    const hashedPassword = await hashPassword(password, salt, iterations);
    return hashedPassword === hash;
}
