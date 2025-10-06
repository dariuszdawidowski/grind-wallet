/**
 * Safe communication through API.js <-> Background.js <-> Connector.js <-> App.js
 */

export class APIConnector {

    constructor(app) {
        this.app = app;
        chrome.runtime.onMessage.addListener(this.recv.bind(this));

    }

    recv(message, sender, sendResponse) {

        // Check sender
        if (sender.id !== chrome.runtime.id) {
            console.warn('Unauthorized attempt to communicate with the extension', sender);
            return true;
        }

        // Request connect
        else if (message?.type === 'REQUEST_CONNECT') {
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

    }

}
