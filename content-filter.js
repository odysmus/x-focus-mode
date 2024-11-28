// Content filtering - remove sections and posts with specified words
(function() {
    'use strict';

    // Configuration arrays for content filtering
    const BLOCKED_SECTIONS = ['Discover more', 'More replies'];
    
    // BLOCKED_WORDS: Add word groups, each group is treated as an AND condition
    // Examples:
    // ['words'] → removes posts containing "words"
    // ['two words'] → removes posts containing both "two" AND "words"
    // ['word', 'two words', 'just three words'] → removes posts containing:
    //    - "word" OR
    //    - ("two" AND "words") OR
    //    - ("just" AND "three" AND "words")
    const BLOCKED_WORDS = [
        // Add your word groups here
        // 'word',
        // 'two words',
        // 'just three words'
    ];

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
     * Checks if text contains all words in a group
     * @param {string} text - The text to check
     * @param {string} wordGroup - Space-separated words that must all be present
     * @returns {boolean} True if all words are found
     */
    function containsAllWords(text, wordGroup) {
        const words = wordGroup.toLowerCase().split(/\s+/);
        return words.every(word => text.includes(word));
    }

    /**
     * Filters tweets and search results containing word groups from BLOCKED_WORDS
     * For each word group, all words in that group must be present to trigger hiding
     * Case-insensitive matching
     */
    function hideBlockedContent() {
        // Filter tweets
        const posts = document.querySelectorAll('div[data-testid="tweetText"]');
        posts.forEach(post => {
            const text = post.textContent.toLowerCase();
            if (BLOCKED_WORDS.length > 0 && BLOCKED_WORDS.some(group => containsAllWords(text, group))) {
                const tweet = post.closest('div[data-testid="cellInnerDiv"]');
                if (tweet) tweet.style.display = 'none';
            }
        });

        // Filter typeahead results (search suggestions)
        const typeaheadResults = document.querySelectorAll('div[data-testid="typeaheadResult"]');
        typeaheadResults.forEach(result => {
            const text = result.textContent.toLowerCase();
            if (BLOCKED_WORDS.length > 0 && BLOCKED_WORDS.some(group => containsAllWords(text, group))) {
                result.style.display = 'none';
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
