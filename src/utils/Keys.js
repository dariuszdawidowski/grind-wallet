/*** Public / private keys helpers ***/

const bip39 = require('bip39');
const hdkey = require('hdkey');
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { AccountIdentifier } from '@dfinity/ledger-icp';

/**
 * Create or recover keypair
 * args:
 *   mnemonic: string - 12-word phrase with space separators or null for generate random
 */

export function keysRecoverFromPhraseSecp256k1(mnemonic = null) {

    // Generate
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    console.log('mnemonic', mnemonic)
    const valid = bip39.validateMnemonic(mnemonic);
    // if (!valid) return null;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('seed', seed)
    const root = hdkey.fromMasterSeed(seed);
    const addrnode = root.derive("m/44'/223'/0'/0/0");
    const identity = Secp256k1KeyIdentity.fromSecretKey(addrnode.privateKey);
    const json = identity.toJSON();
    const principal = identity.getPrincipal();
    const account = AccountIdentifier.fromPrincipal({ principal });
    return { mnemonic, identity, publicKey: json[0], privateKey: json[1], principal: principal.toString(), account: account.toHex()};
}
