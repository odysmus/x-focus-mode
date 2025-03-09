// Lists Redirect Handler - Smooth redirection to specific list
(() => {
    'use strict';
    
    const TARGET_LIST_ID = 'add your list id here';
    const TARGET_LIST_URL = `/i/lists/${TARGET_LIST_ID}`;
    
    // Save original history methods
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    
    // Helper function to smoothly navigate to the target list
    const navigateToTargetList = () => {
        // Use the original pushState to avoid infinite loops
        origPush.call(history, {}, '', TARGET_LIST_URL);
        // Dispatch popstate to trigger page update
        window.dispatchEvent(new PopStateEvent('popstate'));
    };
    
    // Intercept history API calls
    history.pushState = function() {
        if (arguments[2] && typeof arguments[2] === 'string') {
            // Check if navigating to a lists page that's not our target
            if ((arguments[2].includes('/lists') || arguments[2].includes('/i/lists')) && 
                !arguments[2].includes(TARGET_LIST_ID)) {
                // Replace with our target list URL
                arguments[2] = TARGET_LIST_URL;
            }
        }
        return origPush.apply(this, arguments);
    };
    
    // Handle click events on list links
    const handleListLinks = () => {
        const listLinks = document.querySelectorAll('[aria-label="Lists"], [role="link"][href*="lists"]');
        
        listLinks.forEach(link => {
            // Skip if already modified
            if (link.dataset.listRedirectModified) return;
            
            // Mark as modified
            link.dataset.listRedirectModified = 'true';
            
            // Add click handler
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // Only intercept if not already going to our target list
                if (href && !href.includes(TARGET_LIST_ID)) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateToTargetList();
                    return false;
                }
            }, true);
        });
        
        // Continue checking for new list links
        setTimeout(handleListLinks, 1000);
    };
    
    // Start monitoring for list links when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(handleListLinks, 1000));
    } else {
        setTimeout(handleListLinks, 1000);
    }
    
    // Check current URL and redirect if needed
    if ((location.pathname.includes('/lists') || location.pathname.includes('/i/lists')) && 
        !location.pathname.includes(TARGET_LIST_ID)) {
        navigateToTargetList();
    }
})();
