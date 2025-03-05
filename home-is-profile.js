// Home Redirect Handler - Instant home to profile redirect
(() => {
    'use strict';

    // State and original methods
    let redirecting = false, composing = false;
    const origPush = history.pushState, origReplace = history.replaceState;
    
    // Core functions
    const isHome = url => ['/', '/home'].includes(new URL(url).pathname) && !redirecting;
    const isCompose = url => new URL(url).pathname.startsWith('/compose/post');
    
    const redirect = () => {
        redirecting = true;
        // Remove home timeline
        document.querySelectorAll('[aria-label="Home timeline"]').forEach(el => el.remove());
        
        const storedPath = sessionStorage.getItem('userProfilePath');
        if (storedPath) {
            loadProfile(storedPath);
            setTimeout(() => redirecting = false, 1000);
            return;
        }

        // Find and load profile
        const checkProfile = () => {
            document.querySelectorAll('[aria-label="Home timeline"]').forEach(el => el.remove());
            const profileLink = document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');
            if (profileLink) {
                const path = profileLink.getAttribute('href');
                sessionStorage.setItem('userProfilePath', path);
                loadProfile(path);
                setTimeout(() => redirecting = false, 1000);
            } else {
                requestAnimationFrame(checkProfile);
            }
        };

        document.readyState === 'loading' 
            ? document.addEventListener('DOMContentLoaded', checkProfile)
            : checkProfile();
    };

    const loadProfile = path => {
        origPush.call(history, {}, '', '/temp-redirect');
        setTimeout(() => {
            origPush.call(history, {}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
            setTimeout(() => {
                const profileLink = document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');
                if (profileLink) profileLink.click();
            }, 100);
        }, 10);
    };

    // Navigation handler
    const handleNav = (args, origMethod) => {
        if (args[2] && typeof args[2] === 'string') {
            const newUrl = args[2].startsWith('http') ? args[2] : window.location.origin + args[2];
            
            // Check if leaving compose mode
            if (composing && !isCompose(newUrl) && !newUrl.includes('/profile')) {
                composing = false;
                redirect();
                return;
            }
            
            // Update compose flag and check for redirect
            composing = isCompose(newUrl);
            if (isHome(newUrl)) {
                redirect();
                return;
            }
        }
        return origMethod.apply(history, args);
    };

    // Override history methods
    history.pushState = function() { return handleNav(arguments, origPush); };
    history.replaceState = function() { return handleNav(arguments, origReplace); };

    // Initial check
    if (isHome(window.location.href)) {
        redirect();
    } else if (isCompose(window.location.href)) {
        composing = true;
    }

    // Event listeners
    window.addEventListener('popstate', e => {
        const currentUrl = window.location.href;
        const isCurrentCompose = isCompose(currentUrl);
        
        if (composing && !isCurrentCompose && !currentUrl.includes('/profile')) {
            composing = false;
            e.preventDefault();
            e.stopPropagation();
            redirect();
            return;
        }
        
        composing = isCurrentCompose;
        if (isHome(currentUrl)) redirect();
    });

    window.addEventListener('hashchange', () => {
        composing = isCompose(window.location.href);
        if (isHome(window.location.href)) redirect();
    });
    
    // Prevent Escape key from closing the compose dialog
    document.addEventListener('keydown', e => {
        if (composing && e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);
    
    document.addEventListener('click', e => {
        // Handle home links
        const link = e.target.closest('a[href]');
        if (link && ['/home', '/'].includes(link.getAttribute('href'))) {
            e.preventDefault();
            redirect();
        }
        
        // Handle compose close button
        if (composing && e.target.closest('[aria-label="Close"]')) {
            e.preventDefault();
            e.stopPropagation();
            composing = false;
            redirect();
        }
    }, true);
    
    // Monitor URL changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            const wasComposing = composing;
            const isCurrentCompose = isCompose(url);
            composing = isCurrentCompose;
            
            if (wasComposing && !isCurrentCompose && !url.includes('/profile')) {
                redirect();
            }
            
            if (isHome(url)) redirect();
        }
    }).observe(document, { subtree: true, childList: true });
})();
