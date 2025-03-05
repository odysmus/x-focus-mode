// Post Dialog Persistence
(function() {
    let isPosting = false;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // Function to maintain compose modal
    function maintainCompose() {
        if (isPosting) {
            // Use the original pushState to avoid conflicts
            originalPushState.call(history, {}, '', '/compose/post');
            return true;
        }
        return false;
    }

    // Prevent dialog from being closed
    function preventDialogClose() {
        const closeButton = document.querySelector('[aria-label="Close"]');
        if (closeButton) {
            closeButton.style.display = 'none';
        }

        // Prevent Escape key from closing the dialog
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        // Prevent clicking outside to close
        document.addEventListener('click', (e) => {
            if (e.target.getAttribute('role') === 'presentation') {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Prevent closing when text field is selected
        const textField = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (textField) {
            textField.addEventListener('focus', () => {
                isPosting = true;
                window.__isComposing = true;
            });
        }
    }

    // Add URL change monitoring
    function observeUrlChanges() {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                if (isPosting) {
                    maintainCompose();
                    preventDialogClose();
                }
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Watch for tweet button clicks
    document.addEventListener('click', (e) => {
        const tweetButton = e.target.closest('[data-testid="tweetButton"]');
        if (!tweetButton) return;
        
        const isComposePostButton = tweetButton.closest('[aria-label*="Post"]') || 
                                  tweetButton.getAttribute('aria-label')?.includes('Post');
        
        if (isComposePostButton) {
            isPosting = true;
            window.__isComposing = true;
            preventDialogClose();
            
            // Reset flags after the post action completes
            setTimeout(() => {
                if (!document.querySelector('[aria-label*="Post"]')) {
                    isPosting = false;
                    window.__isComposing = false;
                }
            }, 1000);
            return;
        }

        // For the main tweet button
        e.preventDefault();
        e.stopPropagation();
        originalPushState.call(history, {}, '', '/compose/post');
        preventDialogClose();
    });

    // Override history methods
    history.pushState = function() {
        if (isPosting) {
            arguments[2] = '/compose/post';
        }
        return originalPushState.apply(this, arguments);
    };

    history.replaceState = function() {
        if (isPosting) {
            arguments[2] = '/compose/post';
        }
        return originalReplaceState.apply(this, arguments);
    };

    // Block browser back button and page closing
    window.addEventListener('beforeunload', (e) => {
        if (isPosting) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    // Add navigation event listeners
    window.addEventListener('popstate', (e) => {
        if (isPosting) {
            e.preventDefault();
            maintainCompose();
            preventDialogClose();
        }
    });
    
    window.addEventListener('pushstate', (e) => {
        if (isPosting) {
            maintainCompose();
            preventDialogClose();
        }
    });
    
    window.addEventListener('load', () => {
        maintainCompose();
        observeUrlChanges();
        preventDialogClose();
    });

    // Initialize URL observer
    observeUrlChanges();
    
    // Initialize immediately if document is already loaded
    if (document.readyState !== 'loading') {
        maintainCompose();
        preventDialogClose();
    }
})();  
