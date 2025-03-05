(function() {
    // Function to apply or remove grayscale
    function updateGrayscale() {
        const url = window.location.href.toLowerCase();
        if (!url.includes('/bookmarks') && 
            !url.includes('/grok') &&
            !url.includes('/compose/post')) {
            document.documentElement.style.filter = 'grayscale(100%)';
            document.documentElement.style.webkitFilter = 'grayscale(100%)';
        } else {
            document.documentElement.style.filter = 'none';
            document.documentElement.style.webkitFilter = 'none';
        }
    }

    // Run immediately
    updateGrayscale();

    // Also watch for URL changes (for single-page apps)
    const observer = new MutationObserver(updateGrayscale);
    observer.observe(document.documentElement, { subtree: true, childList: true });
})();
