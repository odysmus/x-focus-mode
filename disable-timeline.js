// Profile Redirect Handler - Instant home to profile redirect
const profileRedirectHandler = () => {
    let userProfilePath = '';
    
    // Function to find and store user's profile path
    const findUserProfile = () => {
        const profileLink = document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');
        if (profileLink) {
            const newProfilePath = profileLink.getAttribute('href');
            // Only update if the path has changed
            if (newProfilePath !== userProfilePath) {
                userProfilePath = newProfilePath;
                sessionStorage.setItem('userProfilePath', userProfilePath);
            }
            return true;
        }
        return false;
    };

    // Get stored profile path
    userProfilePath = sessionStorage.getItem('userProfilePath');

    // Instant redirect function
    const redirectToProfile = () => {
        // If we have the path stored, use it immediately
        if (userProfilePath) {
            window.location.replace(userProfilePath); // Using replace to prevent back button issues
            return;
        }

        // If no stored path, find it and redirect
        if (findUserProfile()) {
            window.location.replace(userProfilePath);
        } else {
            // If still not found, retry once quickly
            setTimeout(findUserProfile, 50);
        }
    };

    // Add URL change monitoring using MutationObserver
    const observeUrlChanges = () => {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                interceptHomeNavigation();
            }
        }).observe(document, { subtree: true, childList: true });
    };

    // Add profile path monitoring using MutationObserver
    const observeProfileChanges = () => {
        new MutationObserver(() => {
            findUserProfile();
        }).observe(document.body, { subtree: true, childList: true });
    };

    // Intercept all navigation to home
    const interceptHomeNavigation = () => {
        if (window.location.pathname === '/home' || 
            window.location.pathname === '/' || 
            window.location.href.includes('/home')) {
            redirectToProfile();
            return true;
        }
        return false;
    };

    // Override history methods to catch navigation
    const originalPushState = history.pushState;
    history.pushState = function() {
        const url = arguments[2];
        if (url === '/home' || url === '/' || url.includes('/home')) {
            redirectToProfile();
            return;
        }
        return originalPushState.apply(this, arguments);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
        const url = arguments[2];
        if (url === '/home' || url === '/' || url.includes('/home')) {
            redirectToProfile();
            return;
        }
        return originalReplaceState.apply(this, arguments);
    };

    // Intercept clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, [role="link"], [role="button"]');
        if (!target) return;

        const leadsToHome = 
            target.getAttribute('href') === '/home' ||
            target.getAttribute('href') === '/' ||
            target.getAttribute('href')?.includes('/home') ||
            (target.getAttribute('role') === 'button' && 
             target.textContent.includes('Home')) ||
            target.getAttribute('aria-label')?.includes('Home');

        if (leadsToHome) {
            e.preventDefault();
            e.stopPropagation();
            redirectToProfile();
        }
    }, true);

    // Add navigation event listeners
    window.addEventListener('popstate', () => interceptHomeNavigation());
    window.addEventListener('load', () => {
        interceptHomeNavigation();
        observeUrlChanges();
        observeProfileChanges();
    });
    
    // Initial check
    interceptHomeNavigation();
};

// Initialize as early as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', profileRedirectHandler);
} else {
    profileRedirectHandler();
}

// Add early redirect script to head
const earlyRedirect = document.createElement('script');
earlyRedirect.textContent = `
    if (window.location.pathname === '/home' || 
        window.location.pathname === '/' || 
        window.location.href.includes('/home')) {
        const storedPath = sessionStorage.getItem('userProfilePath');
        if (storedPath) {
            window.location.replace(storedPath);
        }
    }
`;
document.head.insertBefore(earlyRedirect, document.head.firstChild);
