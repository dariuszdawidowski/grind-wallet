/**
 * Storing operation history in IndexedDB database
 */

import { LogBase } from './logbase.js';

export class LogSystem extends LogBase {

    /**
     * Get filtered or all logs
     */

    async get(storeName, args = null) {
        const logs = await this.load(storeName);

        // Optional filtering
        if (args !== null) {
            return Object.fromEntries(Object.entries(logs).filter(([_, value]) => {
                let result = true;
                // Filter by ISO datetime key
                if (('datetime' in args) && args.datetime) result = result && (value.datetime == args.datetime);
                // Filter by types
                if (('types' in args) && args.types) result = result && args.types.includes(value.type);
                // Filter by tokens
                if (('tokens' in args) && args.tokens && ('token' in value)) result = result && args.tokens.includes(value.token.canister);
                // Filter by NFTs
                if (('nfts' in args) && args.nfts && ('nft' in value)) result = result && args.nfts.includes(`${value.nft.canister}:${value.nft.id}`);
                return result;
            }));
        }

        // All logs
        return logs;
    }

}
