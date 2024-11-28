// Content filtering - remove sections and posts with specified words
(function() {
    'use strict';

    // Configuration arrays for content filtering
    const BLOCKED_SECTIONS = ['Discover more', 'More replies'];
    
    // BLOCKED_WORDS_POSTS: Word groups to filter from tweets
    // Examples:
    // ['words'] → removes posts containing "words"
    // ['two words'] → removes posts containing both "two" AND "words"
    // ['word', 'two words'] → removes posts containing "word" OR ("two" AND "words")
    const BLOCKED_WORDS_POSTS = [];

    // BLOCKED_WORDS_SEARCH_SUGGESTIONS: Word groups to filter from search suggestions
    // Uses the same format as BLOCKED_WORDS_POSTS but applies only to search resultS
    // This doesn't filter the posts you see when searching, to filter those use BLOCKED_WORDS_POSTS
    const BLOCKED_WORDS_SEARCH_SUGGESTIONS = [];

    // Text that appears on posts from muted accounts
    const MUTED_TEXT = 'This Post is from an account you muted.';

    /**
     * Scans for and hides UI sections like "Discover more" or "More replies"
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
     * Filters tweets based on BLOCKED_WORDS_POSTS
     * For each word group, all words in that group must be present to trigger hiding
     */
    function hideBlockedPosts() {
        const posts = document.querySelectorAll('div[data-testid="tweetText"]');
        posts.forEach(post => {
            const text = post.textContent.toLowerCase();
            if (BLOCKED_WORDS_POSTS.length > 0 && BLOCKED_WORDS_POSTS.some(group => containsAllWords(text, group))) {
                const tweet = post.closest('div[data-testid="cellInnerDiv"]');
                if (tweet) tweet.style.display = 'none';
            }
        });
    }

    /**
     * Filters search suggestions based on BLOCKED_WORDS_SEARCH_SUGGESTIONS
     * Uses the same word group logic as posts but with a separate word list
     */
    function hideBlockedSearchResults() {
        const typeaheadResults = document.querySelectorAll('div[data-testid="typeaheadResult"]');
        typeaheadResults.forEach(result => {
            const text = result.textContent.toLowerCase();
            if (BLOCKED_WORDS_SEARCH_SUGGESTIONS.length > 0 && BLOCKED_WORDS_SEARCH_SUGGESTIONS.some(group => containsAllWords(text, group))) {
                result.style.display = 'none';
            }
        });
    }

    /**
     * Hides posts from muted accounts
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
    const observer = new MutationObserver(() => {
        hideUnwantedSections();
        hideBlockedPosts();
        hideBlockedSearchResults();
        hideMutedPosts();
    });

    // Start observing the document
    observer.observe(document, { childList: true, subtree: true });
})();
