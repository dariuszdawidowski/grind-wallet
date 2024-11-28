/*** Transaction functions ***/

import { hexStringToUint8Array } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { ICP2ICPt } from '/src/utils/Currency.js';


/**
 * Check balance for given account
 * @param actor: ledger actor
 * @param address: string (Account ID for ICP, Principal ID for ICRC-1/2)
 */

export async function icpLedgerBalance(actor, address) {

    try {
        // ICP
        if ('accountBalance' in actor) return await actor.accountBalance({ accountIdentifier: address });
        // ICRC-1/2
        else if ('balance' in actor) return await actor.balance({ owner: Principal.fromText(address) });
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
