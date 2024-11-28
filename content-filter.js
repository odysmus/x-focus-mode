// Content filtering - remove sections and posts with specified words
(function() {
    'use strict';

    // Configuration arrays for content filtering
    // BLOCKED_SECTIONS: Hides UI sections and their following content (e.g., "Discover more" recommendations)
    const BLOCKED_SECTIONS = ['Discover more', 'More replies'];
    
    // BLOCKED_WORDS: Add space-separated words to filter (case-insensitive)
    // Example: const BLOCKED_WORDS = `test tweet remove`.trim().split(/\s+/).filter(Boolean); 
                // This would remove all posts with the words test or tweet or remove
    // Leave empty to show all tweets → const BLOCKED_WORDS = ``.trim().split(/\s+/).filter(Boolean);
    const BLOCKED_WORDS = ``.trim().split(/\s+/).filter(Boolean);

    // Text that appears on posts from muted accounts
    const MUTED_TEXT = 'This Post is from an account you muted.';

    /**
     * Scans for and hides UI sections like "Discover more" or "More replies"
     * Looks for headings within tweet containers and hides matching sections
     * Also removes all following sibling elements to prevent partial content
     */
    function hideUnwantedSections() {
        const elements = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
        
        for (let element of elements) {
            const heading = element.querySelector('h2 > div:nth-child(2) > span');
            const text = heading?.textContent.trim();
            
            if (text && BLOCKED_SECTIONS.some(word => text.includes(word))) {
                hideElementAndSiblings(element);
            }
        }
    }

    /**
     * Filters tweets containing any words from BLOCKED_WORDS
     * Searches tweet text content and hides the entire tweet if matches are found
     * Case-insensitive matching
     */
    function hideBlockedContent() {
        const posts = document.querySelectorAll('div[data-testid="tweetText"]');
        
        posts.forEach(post => {
            const text = post.textContent.toLowerCase();
            if (BLOCKED_WORDS.some(word => text.includes(word.toLowerCase()))) {
                const tweet = post.closest('div[data-testid="cellInnerDiv"]');
                if (tweet) tweet.style.display = 'none';
            }
        });
    }

    /**
     * Hides posts from muted accounts
     * Identifies muted posts by their notification text
     * Uses display:none to prevent Twitter's re-rendering
     */
    function hideMutedPosts() {
        const elements = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
        
        elements.forEach(element => {
            const notice = element.querySelector('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3');
            if (notice?.textContent.trim() === MUTED_TEXT) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Helper function to hide an element and all its following siblings
     * Used primarily for "Discover more" sections where we need to remove subsequent recommendations
     * @param {Element} element - The starting element to hide
     */
    function hideElementAndSiblings(element) {
        const parent = element.parentNode;
        const startIndex = Array.from(parent.children).indexOf(element);
        
        for (let i = startIndex; i < parent.children.length; i++) {
            parent.children[i].style.display = 'none';
        }
    }

    // MutationObserver watches for DOM changes and applies filters
    // Necessary because Twitter dynamically loads content while scrolling
    const observer = new MutationObserver(() => {
        hideUnwantedSections();
        hideBlockedContent();
        hideMutedPosts();
    });

    // Start observing the document with the configured parameters
    observer.observe(document, { childList: true, subtree: true });
})();
