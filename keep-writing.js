// Post Dialog Persistence
  const preventClose = (e) => {
      if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
          return false;
      }
  };

  // Override pushState once at the start
  history.pushState = ((f) => function pushState() {
      const ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('pushstate'));
      return ret;
  })(history.pushState);

  // Override replaceState
  history.replaceState = ((f) => function replaceState() {
      const ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('replacestate'));
      return ret;
  })(history.replaceState);

  const redirectToCompose = () => {
      // Add a session storage flag to track if we've already left compose
      if (window.location.pathname === '/compose/post') {
          sessionStorage.setItem('leftCompose', 'false');
      } else {
          sessionStorage.setItem('leftCompose', 'true');
      }

      // Only redirect if we're going directly from compose to home
      // and haven't navigated elsewhere yet
      if (window.location.pathname === '/home' && 
          document.referrer.endsWith('/compose/post') &&
          sessionStorage.getItem('leftCompose') === 'false') {
          window.location.href = '/compose/post';
      }
  };

  function initializeComposeBehavior() {
      // Remove existing listeners first to prevent duplicates
      document.removeEventListener('keydown', preventClose, true);
      window.removeEventListener('pushstate', checkForComposePage);
      window.removeEventListener('popstate', checkForComposePage);
      window.removeEventListener('replacestate', checkForComposePage);

      // Only add compose-specific behavior when actually on compose page
      if (location.pathname === '/compose/post') {
          document.addEventListener('keydown', preventClose, true);
      }
  }

  // Watch for URL changes
  function checkForComposePage() {
      // Only initialize compose behavior if we're actually on compose page
      if (location.pathname === '/compose/post') {
          setTimeout(initializeComposeBehavior, 0);
      } else {
          // Remove compose-specific behavior when leaving compose page
          document.removeEventListener('keydown', preventClose, true);
      }
  }

  // Initial checks
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
          redirectToCompose();
          checkForComposePage();
      });
  } else {
      // If DOMContentLoaded has already fired
      redirectToCompose();
      checkForComposePage();
  }

  // Watch for navigation events
  window.addEventListener('popstate', () => {
      redirectToCompose();
      checkForComposePage();
  });
  window.addEventListener('pushstate', checkForComposePage);
  window.addEventListener('replacestate', checkForComposePage);

  // Watch for URL changes using MutationObserver
  const observer = new MutationObserver(() => {
      if (location.pathname === '/compose/post') {
          initializeComposeBehavior();
      }
  });

  // Watch for tweet button click
  document.addEventListener('click', (e) => {
      const tweetButton = e.target.closest('[data-testid="tweetButton"]');
      if (tweetButton) {
          sessionStorage.setItem('justTweeted', 'true');
          window.location.href = '/compose/post';
      }
  });

  // Keep compose modal open after posting
  history.pushState = ((f) => function pushState() {
      const ret = f.apply(this, arguments);
      window.dispatchEvent(new Event('pushstate'));
      return ret;
  })(history.pushState);

  const maintainComposePath = () => {
      // Only redirect if we're coming from a tweet action
      if (sessionStorage.getItem('justTweeted') === 'true' && 
          document.referrer.includes('/compose/post')) {
          history.pushState({}, '', '/compose/post');
          sessionStorage.setItem('justTweeted', 'false');
      }
  };

  window.addEventListener('pushstate', maintainComposePath);
  window.addEventListener('popstate', maintainComposePath);



  // Start observing once DOM is ready
  if (document.body) {
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  } else {
      document.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, {
              childList: true,
              subtree: true
          });
      });
  }
