// Home Redirect Handler - Instant home to post composer redirect
(function() {
    'use strict';

    // Function to check if URL should be redirected
    function shouldRedirect(url) {
        const urlObj = new URL(url);
        return urlObj.pathname === '/home' || 
               urlObj.pathname === '/' || 
               urlObj.pathname.includes('/home');
    }

    // Function to remove home timeline elements
    function removeHomeTimeline() {
        const homeTimelineElements = document.querySelectorAll('[aria-label="Home timeline"]');
        homeTimelineElements.forEach(element => element.remove());
    }

    // Function to handle redirect
    function handleRedirect() {
        // Remove home timeline elements
        removeHomeTimeline();
        
        // Redirect to compose
        window.location.replace('/compose/post');
    }

    // Check URL immediately
    if (shouldRedirect(window.location.href)) {
        handleRedirect();
    }

    // Monitor URL changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        if (arguments[2] && shouldRedirect(arguments[2])) {
            handleRedirect();
            return;
        }
        return originalPushState.apply(this, arguments);
    };

    history.replaceState = function() {
        if (arguments[2] && shouldRedirect(arguments[2])) {
            handleRedirect();
            return;
        }
        return originalReplaceState.apply(this, arguments);
    };

    // Monitor navigation events
    window.addEventListener('popstate', () => {
        if (shouldRedirect(window.location.href)) {
            handleRedirect();
        }
    });

    // Monitor hash changes
    window.addEventListener('hashchange', () => {
        if (shouldRedirect(window.location.href)) {
            handleRedirect();
        }
    });
})();
