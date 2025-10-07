(() => {
    if (window.ic?.grind) return;
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.type = 'module';
    document.documentElement.appendChild(script);
    script.remove();
})();

/**
 * Content message proxy
 */

window.addEventListener('message', async (event) => {

    // Check origin
    if (event.source !== window) return;

    // Send message to Background.js and return response
    if (['GRND_CONNECT', 'GRND_CREATE_ACTOR', 'GRND_CALL_ACTOR'].includes(event.data?.type)) {
        try {
            const response = await chrome.runtime.sendMessage({ type: event.data.type });
            if (response?.error) {
                window.postMessage({ type: 'GRND_ERROR', reason: response.error }, '*');
            } else {
                window.postMessage({ type: 'GRND_RETURN', payload: response }, '*');
            }
        } catch (error) {
            window.postMessage({ type: 'GRND_ERROR', reason: error.message }, '*');
        }
    }
});