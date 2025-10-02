(() => {
    if (window.ic?.grind) return;
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.type = 'module';
    document.documentElement.appendChild(script);
    script.remove();
})();