// Lists Time Gate - Allow access to /i/lists/* only from 19:00 to 21:00 (local time)
(() => {
    'use strict';

    // === Configuration ===
    // Allowed window (local time). End is exclusive by default: [19:00, 21:00)
    const ALLOWED_START = { hour: 19, minute: 0 };
    const ALLOWED_END = { hour: 21, minute: 0 };

    // Optional: hardcode your profile path (e.g. "/yourhandle") to skip DOM lookup.
    const PROFILE_PATH_OVERRIDE = null;

    // Storage key shared with other scripts in this repo.
    const PROFILE_PATH_KEY = 'userProfilePath';

    // === Helpers ===
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

    const isListsPath = (pathname) => /^\/i\/lists\/[^/]+/.test(pathname);

    const findProfileLink = () => {
        const selectors = [
            'a[data-testid="AppTabBar_Profile_Link"]',
            'a[aria-label="Profile"]',
            'a[aria-label*="Profile"][role="link"]',
            'a[href^="/"][role="link"][aria-label*="Profile"]',
        ];

        for (const selector of selectors) {
            const link = document.querySelector(selector);
            const href = link?.getAttribute?.('href');
            if (href && href.startsWith('/')) return link;
        }
        return null;
    };

    let redirecting = false;

    const navigateToProfilePath = (path) => {
        if (!path) return false;
        if (!path.startsWith('/')) path = `/${path}`;
        if (location.pathname === path) return true;

        // Use SPA-friendly navigation (like other scripts in this repo)
        history.pushState({}, '', '/temp-redirect');
        setTimeout(() => {
            history.pushState({}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
            setTimeout(() => {
                const link = findProfileLink();
                if (link) link.click();
            }, 50);
        }, 10);

        return true;
    };

    const redirectToProfile = () => {
        if (redirecting) return;
        redirecting = true;
        setTimeout(() => (redirecting = false), 15000);

        if (PROFILE_PATH_OVERRIDE) {
            navigateToProfilePath(PROFILE_PATH_OVERRIDE);
            setTimeout(() => (redirecting = false), 1000);
            return;
        }

        const stored = sessionStorage.getItem(PROFILE_PATH_KEY);
        if (stored) {
            navigateToProfilePath(stored);
            setTimeout(() => (redirecting = false), 1000);
            return;
        }

        const tryFind = () => {
            const link = findProfileLink();
            const href = link?.getAttribute?.('href');
            if (href) {
                sessionStorage.setItem(PROFILE_PATH_KEY, href);
                navigateToProfilePath(href);
                setTimeout(() => (redirecting = false), 1000);
                return;
            }
            requestAnimationFrame(tryFind);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tryFind), { once: true });
        } else {
            requestAnimationFrame(tryFind);
        }
    };

    const gate = () => {
        if (isListsPath(location.pathname) && !isWithinWindow()) {
            redirectToProfile();
        }
    };

    // Initial check
    gate();

    // Block clicks to lists outside the allowed window
    document.addEventListener(
        'click',
        (e) => {
            const link = e.target?.closest?.('a[href]');
            const href = link?.getAttribute?.('href');
            if (!href) return;

            const url = new URL(href, location.origin);
            if (url.origin !== location.origin) return;

            if (isListsPath(url.pathname) && !isWithinWindow()) {
                e.preventDefault();
                e.stopPropagation();
                redirectToProfile();
            }
        },
        true
    );

    // Observe navigation changes (SPA)
    window.addEventListener('popstate', gate);
    window.addEventListener('hashchange', gate);

    // Best-effort URL change detector without clobbering other scripts
    try {
        const origPush = history.pushState;
        const origReplace = history.replaceState;

        history.pushState = function () {
            const res = origPush.apply(this, arguments);
            gate();
            return res;
        };
        history.replaceState = function () {
            const res = origReplace.apply(this, arguments);
            gate();
            return res;
        };
    } catch {
        // ignore
    }

    // Fallback: watch for DOM mutations that typically accompany route changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            gate();
        }
    }).observe(document, { subtree: true, childList: true });
})();
