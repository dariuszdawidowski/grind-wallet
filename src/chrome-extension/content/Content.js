(() => {
    if (window.ic?.grind) return;
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.type = 'module';
    document.documentElement.appendChild(script);
    script.remove();
})();

window.addEventListener('message', async (event) => {
    if (event.source !== window || event.data?.type !== 'GW_OPEN_POPUP') return;
    try {
        const wallet = await chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
        if (wallet?.error) {
            window.postMessage({ type: 'GW_WALLET_ERROR', reason: wallet.error }, '*');
        } else {
            window.postMessage({ type: 'GW_WALLET', payload: wallet }, '*');
        }
    } catch (error) {
        window.postMessage({ type: 'GW_WALLET_ERROR', reason: error.message }, '*');
    }
});