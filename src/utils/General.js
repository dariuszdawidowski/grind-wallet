/*** General helpers ***/


/**
 * GEnerate wallet name
 * args:
 *   wallets - reference to wallets
 *   crypto - which blockchain
 */

export function genWalletName(wallets, crypto) {

    return `${crypto} #${Object.keys(wallets).length + 1}`;
}
