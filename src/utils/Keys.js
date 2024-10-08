/*** Public / private keys helpers ***/

const bip39 = require('bip39');
const hdkey = require('hdkey');
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { hexStringToUint8Array } from '@dfinity/utils';

/**
 * Create or recover keypair
 * args:
 *   mnemonic: string - 12-word phrase with space separators or null for generate random
 */

export function keysRecoverFromPhraseSecp256k1(mnemonic = null) {

    // Generate
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    // Valid
    const valid = bip39.validateMnemonic(mnemonic);
    if (!valid) return null;
    // Convert
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrnode = root.derive("m/44'/223'/0'/0/0");
    const identity = Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
    const json = identity.toJSON();
    const principal = identity.getPrincipal();
    const account = AccountIdentifier.fromPrincipal({ principal });
    return { mnemonic, identity, public: json[0], private: json[1], principal: principal.toString(), account: account.toHex()};
}


/**
 * Recreate principal ID and account ID 
 * args:
 *   privateKey: string hex - private key
 */

export function identityFromPrivate(privateKey) {

	if (typeof(privateKey) == 'string') privateKey = hexStringToUint8Array(privateKey);
    const identity = Secp256k1KeyIdentity.fromSecretKey(privateKey);
    const json = identity.toJSON();
    const principal = identity.getPrincipal();
    const account = AccountIdentifier.fromPrincipal({ principal });
    return { identity, principal: principal.toString(), account: account.toHex()};
}


/**
 * Encrypt key
 */

export async function encryptKey(text, password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
       ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        enc.encode(text)
    );
    return { ciphertext, iv, salt };
}
  

/**
 * Decrypt key
 */

export async function decryptKey(encryptedData, password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encryptedData.salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: encryptedData.iv },
        key,
        encryptedData.ciphertext
    );
    return new TextDecoder().decode(decrypted);
  }
  