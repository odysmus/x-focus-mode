// Tab Handler - Automatically redirect from "For You" to "Following" tab
const tabHandler = new MutationObserver(() => {
    // Only handle tabs on the home page
    if (window.location.pathname !== '/home') {
        return;
    }

    // Find all tabs with role="tab"
    const tabs = document.querySelectorAll('[role="tab"]');
    const followingTab = Array.from(tabs).find(tab => 
        tab.textContent.includes('Following') || 
        tab.getAttribute('aria-label')?.includes('Following')
    );

    // Click the "Following" tab if found and not already selected
    if (followingTab && followingTab.getAttribute('aria-selected') === 'false') {
        followingTab.click();
        
        // Verify the click worked
        setTimeout(() => {
            if (followingTab.getAttribute('aria-selected') === 'true') {
                tabHandler.disconnect();
            }
        }, 100);
    }
});

// Start tab handler only on the home page
if (window.location.pathname === '/home') {
    tabHandler.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

// Element Remover - Remove "For you" elements
const elementRemover = new MutationObserver((mutations) => {
    // Select and remove "For you" presentation divs
    const presentationDivs = document.querySelectorAll('div[role="presentation"]');
    presentationDivs.forEach(div => {
        if (div.textContent.includes('For you')) {
            div.remove();
        }
    });
});

// Start observing the document for changes to remove "For you" elements
elementRemover.observe(document.documentElement, {
    childList: true,
    subtree: true
});
