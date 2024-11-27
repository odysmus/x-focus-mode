// Tab Handler - Automatically redirect from "For You" to "Following" tab
const tabHandler = new MutationObserver(() => {
    // Only handle tabs on the home page
    if (window.location.pathname !== '/home') {
        return;
    }

    const tabList = document.querySelector('[role="tablist"][data-testid="ScrollSnap-List"]');
    if (tabList) {
        // Find the "Following" tab
        const followingTab = Array.from(tabList.children).find(
            tab => tab.textContent.includes('Following')
        );
        // Click the "Following" tab if it's not already selected
        if (followingTab && !followingTab.getAttribute('aria-selected')) {
            const clickableElement = followingTab.querySelector('a, button') || followingTab;
            clickableElement.click();
            tabHandler.disconnect(); // Disconnect after successful click
        }
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
