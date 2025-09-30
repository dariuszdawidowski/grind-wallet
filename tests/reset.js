/**
 * Reset session
 */

(async () => {
    try {
        const items = await chrome.storage.session.get(['active', 'password']);
        if (items.hasOwnProperty('active') && items.hasOwnProperty('password')) {
            await chrome.storage.session.remove(['active', 'password']);
        }
    } catch (err) {
        console.error('Error accessing session storage:', err);
    }
})();