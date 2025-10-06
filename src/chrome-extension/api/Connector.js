/**
 * Messages API.js <-> Content.js <-> Background.js <-> Connector.js <-> App.js
 */

export class APIConnector {

    constructor(app) {
        this.app = app;
        chrome.runtime.onMessage.addListener(this.recv.bind(this));
    }

    /**
     * Receive message from Background.js
     */

    recv(message, sender, sendResponse) {

        // Check sender
        if (sender.id !== chrome.runtime.id) {
            console.warn('Unauthorized attempt to communicate with the extension', sender);
            return true;
        }

        // Request connect
        else if (message?.type === 'REQUEST_CONNECT') {
            return this.requestConnect(sendResponse);
        }

        // Create an actor
        else if (message?.type === 'CREATE_ACTOR') {
            return this.createActor(message, sendResponse);
        }

        // Call actor method through proxy
        else if (message?.type === 'CALL_ACTOR_METHOD') {
            return this.callActor(message, sendResponse);
        }

    }

    /**
     * Request connect
     */

    requestConnect(sendResponse) {
        this.app.connect().then((safeWallet) => {
            if (safeWallet) {
                sendResponse(safeWallet);
            }
            else {
                sendResponse({ error: 'WALLET_NOT_FOUND' });
            }
        })
        .catch((error) => {
            sendResponse({ error: error.message });
        });
        return true;
    }

    /**
     * Create an actor
     */

    createActor(message, sendResponse) {
        try {
            // TODO: Temporary just first wallet, will make picker later
            const [wallet] = Object.values(this.app.user.wallets);
            
            if (!wallet || !wallet.agent) {
                sendResponse({ error: 'AGENT_NOT_AVAILABLE' });
                return true;
            }
            
            // Whitelist (later)
            // if (!message.canisterId || !this.app.isWhitelisted(message.canisterId)) {
            //     sendResponse({ error: 'CANISTER_NOT_WHITELISTED' });
            //     return true;
            // }
            
            // Create actor
            const actor = Actor.createActor(message.interfaceFactory, {
                agent: wallet.agent,
                canisterId: message.canisterId
            });
            
            // Proxy for actor calls
            const actorId = crypto.randomUUID();
            this.app.cache.set(actorId, actor);
            
            // Return actor id to comunicate through proxy
            sendResponse({ actorId });
        }
        catch (error) {
            sendResponse({ error: error.message });
        }
        return true;
    }

    /**
     * Call actor's methou through proxy
     */

    callActor(message, sendResponse) {
        const { actorId, method, args, isUpdate } = message;
        
        // Get actor from cache
        const actor = this.app.cache.get(actorId);
        if (!actor) {
            sendResponse({ error: 'ACTOR_NOT_FOUND' });
            return true;
        }
        
        // Update (read-write)
        if (isUpdate) {
            // this.app.sheet.confirm({
                // title: 'Confirm operation',
                // message: `Do you confirm '${method}' on canister (...) ?`,
                // onConfirm: async () => {
                async () => { // remove later
                    try {
                        const result = await actor[method](...(args || []));
                        sendResponse({ result });
                    } catch (error) {
                        sendResponse({ error: error.message });
                    }
                } // remove later
                // },
                // onCancel: () => {
                    // sendResponse({ error: 'USER_REJECTED' });
                // }
            // });
        }
        // Query (read-only)
        else {
            actor[method](...(args || []))
                .then(result => sendResponse({ result }))
                .catch(error => sendResponse({ error: error.message }));
        }

        return true;
    }

}
