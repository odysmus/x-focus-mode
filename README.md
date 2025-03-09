# X-Focus-Mode
Custom theme and scripts for x.com to help you focus on building and posting without distractions.

Tired of wasting hours to mindless scrolling? Transform your X experience from a time-sink into a powerful sharing tool. Benefit from the opportunities it offers without the pain that comes from consuming irrelevant content that has no real impact on your life. No need to delete your account - use X as a posting tool.

# How to use
OPTION 1: Install a browser with the ability to customize sites like [Arc browser](https://arc.net/). For Arc, create a "New Boost" while on x.com, copy and paste the code into the boost floating window. Css code into css tab and viceversa for js. Restart tab and enjoy. (I do this)

OPTION 2: Find an extension capable of applying custom css and js to a site. For example, [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en-US).




# Features

Currently I use:

### 📄 [theme.css](https://github.com/odysmus/X-Focus-Mode/blob/main/theme.css)
A thoughtfully crafted essentialist visual overhaul.
- 🪧 Clean, distraction-free post visualization
- 🥷 Auto hide and show on hover post interaction buttons
- 📝 Enhanced writing post UI, the pop up is now integrated
- ↔️ Custom timeline width (700px) & left sidebar repositioning
- 🔥 Removes visual noise (right sidebar, who to follow, trending, +)

### 📄 [home-is-profile.js](https://github.com/odysmus/X-Focus-Mode/blob/main/home-is-profile.js)
- 🏠 Automatically redirects from home timeline to your profile.
- 🔥 Disables the home timeline (for you and following tabs)
- ✍️ Automatically redirects to profile after posting.

---

### 📄 [keep-writing.js](https://github.com/odysmus/X-Focus-Mode/blob/main/keep-writing.js)
> ⚠️ If you want to use this feature add it to the top of your JS file for the code to work

Transform the posting experience into a focused writing environment, letting you maintain your creative flow without interruption. Enables consecutive posting without getting distracted by the feed.
- 📍 Stays on the dedicated posting page (x.com/compose/post)
- ✋ Prevents automatic redirect to home feed after posting

### 📄 [remove-for-you.js](https://github.com/odysmus/X-Focus-Mode/blob/main/remove-for-you.js)
Puts you in control of your timeline, curate your inputs with accounts that align with your vision.
- 🔄 Auto-redirects from "For you" to "Following" feed
- 🔥 Removes all "For you" tab appearances

### 📄 [content-filter.js](https://github.com/odysmus/X-Focus-Mode/blob/main/content-filter.js)
Curate the content you want to see, remove unwanted posts from capturing your attention.
- 🔥 Removes the following sections: Discover more, More replies, Posts from muted accounts
- 🔍 Removes all posts and search results that contain the word or group of words you add into:
  - const BLOCKED_WORDS_POSTS = ['word','two words','just three words'];
  - const BLOCKED_WORDS_SEARCH_SUGGESTIONS = ['word','two words','just three words'];
  
### 📄 [home-is-post-composer.js](https://github.com/odysmus/X-Focus-Mode/blob/main/home-is-post-composer.js)
- 🏠 Automatically redirects from home timeline to the post composer.

---

This repository has been created for you to adapt it to your liking, preferences and workflow.

Technology is to be enjoyed as a catalyst for manifesting your potential not to be enslaved by it.

Unlock your creative force.


