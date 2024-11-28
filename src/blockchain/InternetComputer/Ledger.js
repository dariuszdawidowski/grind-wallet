/*** Transaction functions ***/

import { hexStringToUint8Array } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { ICP2ICPt, formatE8S } from '/src/utils/Currency.js';


/**
 * Check balance for given account
 * @param actor: ledger actor
 * @param account: string hex or Uint8Array
 */

export async function icpLedgerBalance(actor, account) {

    try {
        const response = await actor.accountBalance({ accountIdentifier: account });
        //const response = await actor.balance({ accountIdentifier: account }); // ICRC
        return response;
    }
    catch (error) {
        console.error(error);
    }

    return null;
}


/**
 * Transfer ICP
 * @param actor: ledger actor - actor with bound spender identity through agent
 * @param account: string hex or Uint8Array - destination account
 * @param amount: Number - amount of tokens to send
 */

export async function icpLedgerTransfer(actor, account, amount) {

    if (typeof(account) == 'string') account = hexStringToUint8Array(account);

    try {
        const response = await actor.transfer({
            to: account,
            amount: ICP2ICPt(amount)
        });
        return {'OK': response};
    }
    catch (error) {
        return {'ERROR': error};
    }
}


/**
 * Fee for transfer
 * @param actor: ledger actor - actor with bound spender identity through agent
 */

export async function icpLedgerFee(actor) {

    try {
        const response = await actor.transactionFee();
        return response;
    }
    catch (error) {
        console.error(error);
    }

    return null;
}
