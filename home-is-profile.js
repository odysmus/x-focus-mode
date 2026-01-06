// Home Redirect Handler - Always send /home → profile (minimal + reliable)
(() => {
    'use strict';

    const PROFILE_PATH_KEY = 'userProfilePath';
    const HOME_PATHS = new Set(['/', '/home']);

    const isHomePath = (pathname) => HOME_PATHS.has(pathname);

    const getProfileLink = () =>
        document.querySelector('a[data-testid="AppTabBar_Profile_Link"]') ||
        document.querySelector('a[aria-label="Profile"]') ||
        document.querySelector('a[href^="/"][role="link"][aria-label*="Profile"]');

    const storeProfilePath = (path) => {
        if (!path) return;
        try { sessionStorage.setItem(PROFILE_PATH_KEY, path); } catch { /* ignore */ }
        try { localStorage.setItem(PROFILE_PATH_KEY, path); } catch { /* ignore */ }
    };

    const getStoredProfilePath = () => {
        try {
            return sessionStorage.getItem(PROFILE_PATH_KEY) || localStorage.getItem(PROFILE_PATH_KEY);
        } catch {
            return null;
        }
    };

    const goProfile = () => {
        // 1) Prefer a real click (lets X's router do the right thing)
        const link = getProfileLink();
        const href = link?.getAttribute?.('href');
        if (href) storeProfilePath(href);
        if (link) {
            link.click();
            return;
        }

        // 2) Fallback: hard navigation if we have a cached profile path
        const stored = getStoredProfilePath();
        if (stored) window.location.assign(stored);
    };

    const handleHome = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        goProfile();
    };

    // If you land on /home (including new tab), immediately go to profile.
    if (isHomePath(location.pathname)) goProfile();

    // Intercept clicks on the Home button/link.
    document.addEventListener(
        'click',
        (e) => {
            const link = e.target?.closest?.('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            const isHomeLink =
                link.matches?.('a[data-testid="AppTabBar_Home_Link"]') ||
                link.getAttribute('aria-label') === 'Home' ||
                href === '/home' ||
                href === '/';

            if (!isHomeLink) return;
            handleHome(e);
        },
        true
    );

    // Catch back/forward navigation to /home.
    window.addEventListener('popstate', () => {
        if (isHomePath(location.pathname)) goProfile();
    });
})();
