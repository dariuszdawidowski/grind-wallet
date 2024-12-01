/*** ICP/ICRC-1/2 Transaction functions ***/

import { hexStringToUint8Array } from '@dfinity/utils';
import { Principal } from '@dfinity/principal';
import { ICP2icpt } from '/src/utils/Currency.js';

/**
 * NOTE: NOT FOR DIRECT USE: should be binded to wallet.token[id]
 */


/**
 * Check ICP balance
 */

export async function icpLedgerBalance() {

    try {

        return await this.actor.accountBalance({ accountIdentifier: this.account });

    }
    catch (error) {
        console.error(error);
    }

    return null;
}


/**
 * Check ICRC-1/2 balance
 */

export async function icrcLedgerBalance() {

    try {

        return await this.actor.balance({ owner: Principal.fromText(this.principal) });

    }
    catch (error) {
        console.error(error);
    }

    return null;
}


/**
 * Transfer ICP
 * @param args.account: string | Uint8Array - destination (Account ID)
 * @param args.amount: Number - amount of tokens to send
 */

export async function icpLedgerTransfer(args) {

    if (typeof(args.account) == 'string') args.account = hexStringToUint8Array(args.account);

    try {
        const response = await this.actor.transfer({
            to: args.account,
            amount: ICP2icpt(args.amount, this.decimals)
        });

        return {'OK': response};
    }
    catch (error) {
        return {'ERROR': error};
    }
}


/**
 * Transfer ICRC-1/2
 * @param args.principal: string | Principal - destination (Principal ID)
 * @param args.amount: Number - amount of tokens to send
 */

export async function icrcLedgerTransfer(args) {

    if (('principal' in args) && typeof(args.principal) == 'string') args.principal = Principal.fromText(args.principal);

    try {
        const response = await this.actor.transfer({
            to: {
                owner: args.principal,
                subaccount: []
            },
            amount: ICP2icpt(args.amount, this.decimals)
        });

        return {'OK': response};
    }
    catch (error) {
        return {'ERROR': error};
    }
}


/**
 * Fee for transfer both for ICP and ICRC-1/2
 */

/*export async function icpLedgerFee() {

    try {
        return await this.actor.transactionFee();
    }
    catch (error) {
        console.error(error);
    }

    return null;
}*/


/**
 * Token info both for ICP and ICRC-1/2
 */

/*export async function icpLedgerMetadata() {

    try {
        const data = await this.actor.metadata({});
        return Object.fromEntries(data);
    }
    catch (error) {
        console.error(error);
    }

    return null;
}*/
