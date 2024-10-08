/*** Transaction functions ***/

import { hexStringToUint8Array } from '@dfinity/utils';


/**
 * Check balance for given account
 * @param actor: ledger actor
 * @param account: string hex or Uint8Array
 */

export async function icpLedgerBalance(actor, account) {

	if (typeof(account) == 'string') account = hexStringToUint8Array(account);

    try {
        const response = await actor.account_balance({ account });
        if ('e8s' in response) {
            return response.e8s;
        }
    }
    catch (error) {
        console.error(error);
    }

    return null;
}
