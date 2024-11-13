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


/**
 * Transfer ICP
 * @param actor: ledger actor - actor with bound spender identity through agent
 * @param principal: string hex or Principal - destination principal
 * @param account: string hex or Uint8Array - destination account
 * @param icp: Number - amount in ICP to send
 */

export async function icpLedgerTransfer(actor, principal, account, icp) {

    if (typeof(principal) == 'string') principal = Principal.fromText(principal);
	if (typeof(account) == 'string') account = hexStringToUint8Array(account);

    const response = await actor.icrc1_transfer({
        to: {owner: principal, subaccount: []},
        fee: [],
        memo: [],
        amount: ICP2ICPt(icp),
        from_subaccount: [],
        created_at_time: [],
    });

    const result = {};

    if ('Ok' in response) {
        result['OK'] = response.Ok;
    }
    else if ('Err' in response) {
        if ('BadFee' in response.Err) result['ERROR'] = `Error: bad fee, expected: ${formatE8S(response.Err.BadFee.expected_fee)} ICP`;
        else if ('BadBurn' in response.Err) result['ERROR'] = `Error: bad burn, min amount: ${formatE8S(response.Err.BadBurn.min_burn_amount)} ICP`;
        else if ('InsufficientFunds' in response.Err) result['ERROR'] = `Error: insufficient funds: ${formatE8S(response.Err.InsufficientFunds.balance)} ICP`;
        else if ('TooOld' in response.Err) result['ERROR'] = `Error: too old`;
        else if ('CreatedInFuture' in response.Err) result['ERROR'] = `Error: created in future`;
        else if ('Duplicate' in response.Err) result['ERROR'] = `Error: duplicate`;
        else if ('TemporarilyUnavailable' in response.Err) result['ERROR'] = `Error: temporarily unavailable`;
        else result['ERROR'] = 'Transfer error';
    }
    else {
        result['ERROR'] = 'Transfer error';
    }

    return result;
}


/**
 * Fee for transfer
 * @param actor: ledger actor - actor with bound spender identity through agent
 */

export async function icpLedgerFee(actor) {

    try {
        const response = await actor.icrc1_fee();
        return response;
    }
    catch (error) {
        console.error(error);
    }

    return null;
}
