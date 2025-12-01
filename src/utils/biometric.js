/*** Biometric authorization helpers ***/

import { browser } from '/src/utils/browser.js';

/**
 * Register biometric user
 */

export async function registerBiometric() {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKey = {
        challenge: challenge,
        rp: { name: 'Grind Wallet' },
        user: {
            id: userId,
            name: 'GrindWalletUser',
            displayName: 'Grind Wallet User',
        },
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256 (ECDSA)
            { type: 'public-key', alg: -257 } // RS256 (RSA)
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
    };

    try {
        const credential = await navigator.credentials.create({ publicKey });
        await browser.storage.local.set({ webauthn: JSON.stringify(credential) });
        console.log('Rejestracja zakończona:', credential);
    } catch (error) {
        console.error('Błąd rejestracji:', error);
    }
}

/**
 * Authenticate biometric user
 */

export async function loginBiometric(credential) {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKey = {
        challenge: challenge,
        allowCredentials: [{
            type: 'public-key',
            id:  Uint8Array.from(credential.id).buffer,
        }],
        timeout: 60000,
        userVerification: 'required',
    };

    try {
        const assertion = await navigator.credentials.get({ publicKey });

        if (assertion.response.signature === credential.response.signature) {
            console.log('Logowanie zakończone sukcesem');
        } else {
            console.log('Błąd logowania');
        }
    } catch (error) {
        console.error('Błąd logowania:', error);
    }
}
