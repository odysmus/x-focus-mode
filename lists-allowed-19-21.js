// Lists Time Gate - Allow access to /i/lists/* only from 19:00 to 21:00 (local time)
(() => {
    'use strict';

    // Allowed window (local time). End is exclusive: [19:00, 21:00)
    const ALLOWED_START = { hour: 19, minute: 0 };
    const ALLOWED_END = { hour: 21, minute: 0 };

    const PROFILE_PATH_KEY = 'userProfilePath';

    const minutesSinceMidnight = (d) => d.getHours() * 60 + d.getMinutes();
    const toMinutes = ({ hour, minute }) => hour * 60 + minute;

    const isWithinWindow = (now = new Date()) => {
        const current = minutesSinceMidnight(now);
        const start = toMinutes(ALLOWED_START);
        const end = toMinutes(ALLOWED_END);

        if (start === end) return false;
        if (start < end) return current >= start && current < end;
        return current >= start || current < end; // handles windows spanning midnight
    };

    const isListsPath = (pathname) => /^\/i\/lists(\/|$)/.test(pathname);

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
        try { return sessionStorage.getItem(PROFILE_PATH_KEY) || localStorage.getItem(PROFILE_PATH_KEY); }
        catch { return null; }
    };

    const goProfile = () => {
        const link = getProfileLink();
        const href = link?.getAttribute?.('href');
        if (href) storeProfilePath(href);
        if (link) {
            link.click();
            return true;
        }

        const stored = getStoredProfilePath();
        if (stored) {
            window.location.assign(stored);
            return true;
        }

        // Last resort: bounce to /home (home redirect script can take over if present).
        window.location.assign('/home');
        return true;
    };

    const goProfileWithRetry = (maxMs = 2000) => {
        if (goProfile()) return;

        const start = Date.now();
        const tick = () => {
            if (goProfile()) return;
            if (Date.now() - start > maxMs) return;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const gate = () => {
        if (isListsPath(location.pathname) && !isWithinWindow()) goProfileWithRetry();
    };

    const maybeBlockListsNavigation = (e) => {
        if (isWithinWindow()) return;

        const link = e.target?.closest?.('a[href]');
        const href = link?.getAttribute?.('href');
        if (!href) return;

        const url = new URL(href, location.origin);
        if (url.origin !== location.origin) return;
        if (!isListsPath(url.pathname)) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        goProfileWithRetry();
    };

    // Initial check (direct navigation / new tab)
    gate();

    // In-app navigation guards (capture early so we don't "go through then redirect")
    document.addEventListener('pointerdown', maybeBlockListsNavigation, true);
    document.addEventListener('click', maybeBlockListsNavigation, true);
    document.addEventListener('auxclick', maybeBlockListsNavigation, true);
    window.addEventListener('popstate', gate);
})();
