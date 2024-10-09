/*** Transaction functions ***/

import { hexStringToUint8Array } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { ICP2ICPt } from './Currency.js';

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

    let response = await actor.icrc1_transfer({
        to: {owner: principal, subaccount: []},
        fee: [],
        memo: [],
        amount: ICP2ICPt(icp),
        from_subaccount: [],
        created_at_time: [],
    });

    /*
    let response = await actor.transfer({
        to: account,
        fee: { e8s: BigInt(10000) }, // 0.001 ICP
        memo: BigInt(0),
        amount: { e8s: BigInt(10000) }, // 0.001 ICP
        from_subaccount: [],
        created_at_time: [],
    });
    */

    // let response = await actor.icrc2_transfer_from({
    //     to: {owner: principal, subaccount: []},
    //     fee: [],
    //     memo: [],
    //     amount: BigInt(10000), // 0.0001 ICP
    //     from_subaccount: [],
    //     created_at_time: [],
    // });

    return response;
}
