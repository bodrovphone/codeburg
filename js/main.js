// Language-based redirection (only on English version)
try {
  // Check if we're on the English version
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // Check if browser language API is available
    if (typeof navigator !== 'undefined' && navigator.language) {
      const userLang = navigator.language;

      // Safely extract language prefix
      const langPrefix = userLang.split('-')[0].toLowerCase();
      
      // Check if sessionStorage is available
      if (typeof sessionStorage !== 'undefined') {
        try {
          // Only redirect for supported languages and if not already redirected
          if (!sessionStorage.getItem('redirected')) {
            sessionStorage.setItem('redirected', 'true');
            
            const supportedLangs = {
              'bg': '/bg/',
              'ru': '/ru/',
              'uk': '/ua/' // Ukrainian language code is 'uk'
            };

            // Safe type check for langPrefix
            if (typeof langPrefix === 'string' && supportedLangs[langPrefix]) {
              window.location.href = supportedLangs[langPrefix];
            }
          }
        } catch (storageError) {
          // Handle potential QuotaExceededError or SecurityError
          console.warn('Session storage access error:', storageError);
        }
      }
    }
  }
} catch (error) {
  // Catch any unexpected errors without breaking the app
  console.warn('Language detection error:', error);
}

// Type-safe DOM element selection
const languageButton = document.querySelector('.language-button');
const languageDropdown = document.querySelector('.language-dropdown');

if (languageButton instanceof HTMLElement && languageDropdown instanceof HTMLElement) {
  languageButton.addEventListener('click', function() {
    // Only handle dropdown on mobile screens
    if (window.innerWidth <= 600) {
      languageDropdown.style.display = 
        languageDropdown.style.display === 'flex' ? 'none' : 'flex';
    }
  });

  // Close dropdown when clicking outside (only on mobile)
  document.addEventListener('click', function(event) {
    if (event.target instanceof HTMLElement) {
      if (window.innerWidth <= 600 && !event.target.closest('.language-switcher')) {
        languageDropdown.style.display = 'none';
      }
    }
  });

  // Reset display style when screen size changes
  window.addEventListener('resize', function() {
    languageDropdown.style.display = window.innerWidth > 600 ? 'flex' : 'none';
  });
}

ScrollReveal().reveal('#qualifications--list > li:nth-child(odd)', {
  delay: 400,
  distance: '50px',
  origin: 'right',
  viewFactor: 0.3,
});

ScrollReveal().reveal('#qualifications--list > li:nth-child(even)', {
  delay: 600,
  distance: '50px',
  origin: 'right',
  viewFactor: 0.3,
});

ScrollReveal().reveal(
  '#wrapper--stack__items > .card--techstack:nth-child(odd)',
  {
    delay: 400,
    distance: '100px',
    origin: 'bottom',
    viewFactor: 0.3,
  }
);

ScrollReveal().reveal(
  '#wrapper--stack__items > .card--techstack:nth-child(even)',
  {
    delay: 100,
    distance: '100px',
    origin: 'bottom',
    viewFactor: 0.3,
  }
);

ScrollReveal().reveal('.card--work-history', {
  delay: 300,
  distance: '100px',
  origin: 'bottom',
  viewFactor: 0.3,
});

ScrollReveal().reveal('.section--page:last-child', {
  delay: 100,
  distance: '100px',
  origin: 'left',
  viewFactor: 0.1,
});
