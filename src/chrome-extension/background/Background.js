/**
 * Connect to wallet
 */

const requestWalletFromPopup = (retries = 5) => new Promise((resolve, reject) => {
    const attempt = () => {
        chrome.runtime.sendMessage({ type: 'REQUEST_CONNECT' }, (response) => {
            if (chrome.runtime.lastError) {
                if (--retries > 0) return setTimeout(attempt, 100);
                return reject(new Error(chrome.runtime.lastError.message));
            }
            if (response?.error) return reject(new Error(response.error));
            resolve(response);
        });
    };
    attempt();
});

/**
 * Background message proxy
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // TODO: sender.origin - ask user to accept this url only
    // sender.tab.favIconUrl - display icon

    console.log(message?.type);

    // Check sender
    if (sender.id !== chrome.runtime.id) {
        console.warn('Unauthorized attempt to communicate with the extension', sender);
        return true;
    }

    // Open Popup & Connect
    else if (message?.type === 'GRND_CONNECT') {
        chrome.action.openPopup()
            .then(() => requestWalletFromPopup())
            .then((wallet) => sendResponse(wallet))
            .catch((error) => sendResponse({ error: error.message }));
        return true;
    }
});