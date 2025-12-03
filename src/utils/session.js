/**
 * Session manager
 */

import { browser } from '/src/utils/browser.js';

export class Session {

    /**
     * Init session
     * @param {object} args.create - async callback for creating new session
     * @param {object} args.continue - async callback for continuing old session
     * @param {object} args.expired - async callback for expired old session
     * @param {Number} args.timeout - session expiration time in minutes
     */

    async init(args) {

        this.timeout = args.timeout;

        // Get session status
        const status = await this.status();

        // No active session (create new)
        if (status == 'none') {
            // Callback
            await args.create();
        }

        // Session expired
        else if (status == 'expired') {
            // Clear session storage
            await this.clear();
            // Callback
            await args.expired();
        }

        // Session valid - continue
        else if (status == 'valid') {
            // Callback
            await args.continue();
        }

    }

    /**
     * Check that session is expired or not created yet
     * @returns {string} status - 'none' for not created, 'expired' for overdue, 'valid' for continue
     */

    async status() {
        // Get storage session data
        const storageSession = await browser.storage.session.get(['password', 'created']);
        // No active session (create new)
        if (!storageSession.hasOwnProperty('created')) {
            return 'none';
        }
        else {
            // Session expired
            const createdTime = new Date(storageSession.created).getTime();
            if (isNaN(createdTime) || (Date.now() - createdTime) > (this.timeout * 60 * 1000)) {
                return 'expired';
            }
            // Session valid - continue
            else {
                return 'valid';
            }
        }
        return 'unknown';
    }

    /**
     * Reset session
     */

    async clear() {
        await browser.storage.session.remove(['password', 'created']);
    }

    /*** Password helpers ***/

    /**
     * Check password with at least 8 characters long and a mix of uppercase and lowercase letters, numbers, and special characters.
     */

    isPasswordStrong(password) {
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

    async generateSalt(length = 16) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => String.fromCharCode(b)).join('');
    }


    /**
     * Hash given password string
     */

    async hashPassword(password, salt, iterations = 100000) {
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

    async verifyPassword(password, salt, hash, iterations = 100000) {
        const hashedPassword = await this.hashPassword(password, salt, iterations);
        return hashedPassword === hash;
    }

    /**
     * Get raw password from session
     */

    async getPassword() {
        const storageSession = await browser.storage.session.get('password');
        if (storageSession.hasOwnProperty('password')) {
            return storageSession.password;
        }
        return null;
    }
}
