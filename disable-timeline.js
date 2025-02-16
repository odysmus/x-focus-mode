// Profile Redirect Handler - Instant home to profile redirect
(() => {
    'use strict';

    // Function to check if URL should be redirected
    function shouldRedirect(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname === '/home' || 
                   urlObj.pathname === '/' || 
                   urlObj.pathname.includes('/home');
        } catch {
            return false;
        }
    }

    // Function to get profile path
    function getProfilePath() {
        return sessionStorage.getItem('userProfilePath') || null;
    }

    // Function to find profile link in the DOM
    function findProfileLink() {
        const profileLink = document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');
        if (profileLink) {
            const path = profileLink.getAttribute('href');
            sessionStorage.setItem('userProfilePath', path);
            return path;
        }
        return null;
    }

    // Function to navigate to profile
    function navigateToProfile(event) {
        let profilePath = getProfilePath();
        
        if (!profilePath) {
            profilePath = findProfileLink();
        }

        if (profilePath) {
            if (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            window.location.replace('https://twitter.com' + profilePath);
            return true;
        }
        return false;
    }

    // Intercept before page loads
    window.addEventListener('beforeunload', (event) => {
        const targetUrl = window.location.href;
        if (shouldRedirect(targetUrl)) {
            const profilePath = getProfilePath();
            if (profilePath) {
                event.preventDefault();
                window.location.replace('https://twitter.com' + profilePath);
                return false;
            }
        }
    }, true);

    // Intercept clicks before they trigger navigation
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a, [role="link"], [role="button"]');
        if (!target) return;

        const href = target.getAttribute('href');
        if (href && shouldRedirect(href)) {
            navigateToProfile(event);
        }
    }, true);

    // Override window.location
    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;
    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');

    window.location.assign = function(url) {
        if (shouldRedirect(url)) {
            navigateToProfile();
            return;
        }
        return originalAssign.apply(this, arguments);
    };

    window.location.replace = function(url) {
        if (shouldRedirect(url)) {
            navigateToProfile();
            return;
        }
        return originalReplace.apply(this, arguments);
    };

    Object.defineProperty(window.location, 'href', {
        set(url) {
            if (shouldRedirect(url)) {
                navigateToProfile();
                return;
            }
            return originalHref.set.call(this, url);
        }
    });

    // Override history methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        if (arguments[2] && shouldRedirect(arguments[2])) {
            navigateToProfile();
            return;
        }
        return originalPushState.apply(this, arguments);
    };

    history.replaceState = function() {
        if (arguments[2] && shouldRedirect(arguments[2])) {
            navigateToProfile();
            return;
        }
        return originalReplaceState.apply(this, arguments);
    };

    // Monitor navigation events
    window.addEventListener('popstate', (event) => {
        if (shouldRedirect(window.location.href)) {
            navigateToProfile(event);
        }
    }, true);

    window.addEventListener('hashchange', (event) => {
        if (shouldRedirect(window.location.href)) {
            navigateToProfile(event);
        }
    }, true);

    // Check initial URL
    if (shouldRedirect(window.location.href)) {
        navigateToProfile();
    }

    // Observe DOM for profile link
    const observer = new MutationObserver(() => {
        if (!getProfilePath()) {
            const path = findProfileLink();
            if (path && shouldRedirect(window.location.href)) {
                navigateToProfile();
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
