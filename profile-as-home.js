// Home Redirect Handler - Instant home to profile redirect
(() => {
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

        const storedPath = sessionStorage.getItem('userProfilePath');
        if (storedPath) {
            window.location.replace(storedPath);
            return;
        }

        // If we don't have a stored path, we need to wait for the DOM and find it
        const checkForProfile = () => {
            removeHomeTimeline(); // Also remove during checks
            const profileLink = document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');
            if (profileLink) {
                const newProfilePath = profileLink.getAttribute('href');
                sessionStorage.setItem('userProfilePath', newProfilePath);
                window.location.replace(newProfilePath);
            } else {
                // Keep checking until we find it
                requestAnimationFrame(checkForProfile);
            }
        };

        // Start checking as soon as possible
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkForProfile);
        } else {
            checkForProfile();
        }
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
