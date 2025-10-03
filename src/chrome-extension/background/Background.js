const requestWalletFromPopup = (retries = 5) => new Promise((resolve, reject) => {
    const attempt = () => {
        chrome.runtime.sendMessage({ type: 'REQUEST_WALLET' }, (response) => {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'OPEN_POPUP') {
        chrome.action.openPopup()
            .then(() => requestWalletFromPopup())
            .then((wallet) => sendResponse(wallet))
            .catch((error) => sendResponse({ error: error.message }));
        return true;
    }
});