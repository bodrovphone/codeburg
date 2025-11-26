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
  languageButton.addEventListener('click', function(event) {
    // Only handle dropdown on mobile screens
    if (window.innerWidth <= 600) {
      event.stopPropagation();
      languageDropdown.style.display =
        languageDropdown.style.display === 'flex' ? 'none' : 'flex';
    }
  });

  // Close dropdown when clicking outside (only on mobile)
  document.addEventListener('click', function(event) {
    if (event.target instanceof HTMLElement) {
      if (window.innerWidth <= 600 && !event.target.closest('.language-dropdown')) {
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

// Desk Availability Calculation
const DESKS = [
  { id: 'room1-desk1', room: 1, number: 1 },
  { id: 'room1-desk2', room: 1, number: 2 },
  { id: 'room1-desk3', room: 1, number: 3 },
  { id: 'room1-desk4', room: 1, number: 4 },
  { id: 'room2-desk1', room: 2, number: 1 },
  { id: 'room2-desk2', room: 2, number: 2 },
  { id: 'room2-desk3', room: 2, number: 3 },
  { id: 'room2-desk4', room: 2, number: 4 },
];

const SUPABASE_CONFIG = {
  url: 'https://rvvunwqizlzlqrhmmera.supabase.co/rest/v1/desk_bookings',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dnVud3Fpemx6bHFyaG1tZXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzg0NzQsImV4cCI6MjA3MDc1NDQ3NH0.ZzJxdSPJtRkcGTUMNHhig6G8nPVLdJsABr0VPq-wXLI'
};

function isWeekend(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateDatesForNext10Days() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateString = formatDate(currentDate);

    if (!isWeekend(dateString)) {
      dates.push(dateString);
    }
  }

  return dates;
}

async function fetchBookings() {
  try {
    // Calculate date range: today to today + 10 days
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 10);

    const startDateStr = formatDate(today);
    const endDateStr = formatDate(endDate);

    // Filter query: only get bookings within the next 10 days
    const queryParams = new URLSearchParams({
      select: 'desk_id,date,status',
      date: `gte.${startDateStr}`,
    });

    const response = await fetch(`${SUPABASE_CONFIG.url}?${queryParams.toString()}&date=lte.${endDateStr}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.apiKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

function calculateAvailableDesks(bookings, date) {
  let availableCount = 0;
  
  DESKS.forEach(desk => {
    const booking = bookings.find(b => b.desk_id === desk.id && b.date === date);
    
    // If no booking exists OR booking status is 'available', the desk is available
    if (!booking || booking.status === 'available') {
      availableCount++;
    }
  });
  
  return availableCount;
}

async function getNextAvailableDates() {
  try {
    const bookings = await fetchBookings();
    const dates = generateDatesForNext10Days();
    const results = [];
    
    for (const date of dates) {
      const availableDesks = calculateAvailableDesks(bookings, date);
      results.push({
        date: date,
        availableDesks: availableDesks
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error calculating available dates:', error);
    return [];
  }
}

window.DeskAvailability = {
  getNextAvailableDates,
  calculateAvailableDesks,
  fetchBookings,
  DESKS
};

function initAvailabilityButton() {
  const button = document.getElementById('check-availability-btn');
  const resultDiv = document.getElementById('availability-result');

  if (!button || !resultDiv) return;

  const originalButtonHTML = button.innerHTML;

  button.addEventListener('click', async function() {
    const texts = getLocalizedTexts();

    // Disable button and show spinner
    button.disabled = true;
    button.innerHTML = `<span class="spinner"></span> ${texts.buttonLoading}`;

    resultDiv.className = 'availability-result';
    resultDiv.textContent = '';

    try {
      const availableDates = await getNextAvailableDates();

      if (availableDates.length === 0) {
        resultDiv.className = 'availability-result show';
        resultDiv.innerHTML = `<p>${texts.error}</p>`;
        return;
      }

      resultDiv.className = 'availability-result show';
      resultDiv.innerHTML = generateAvailabilityHTML(availableDates);

    } catch (error) {
      console.error('Availability check error:', error);
      resultDiv.className = 'availability-result show';
      resultDiv.innerHTML = `<p>${texts.error}</p>`;
    } finally {
      // Restore button
      button.disabled = false;
      button.innerHTML = originalButtonHTML;
    }
  });
}

function getLocalizedTexts() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/ru/')) {
    return {
      title: 'Следующая доступная дата',
      desks: 'столов',
      noAvailability: 'Нет доступных столов в ближайшие 10 дней. Пожалуйста, свяжитесь с нами напрямую для уточнения наличия.',
      loading: 'Проверяем наличие...',
      buttonLoading: 'Проверяем...',
      error: 'Ошибка при проверке наличия. Попробуйте позже.'
    };
  } else if (currentPath.includes('/ua/')) {
    return {
      title: 'Наступна доступна дата',
      desks: 'столів',
      noAvailability: 'Немає доступних столів у найближчі 10 днів. Будь ласка, зв\'яжіться з нами безпосередньо для уточнення наявності.',
      loading: 'Перевіряємо наявність...',
      buttonLoading: 'Перевіряємо...',
      error: 'Помилка при перевірці наявності. Спробуйте пізніше.'
    };
  } else if (currentPath.includes('/bg/')) {
    return {
      title: 'Следваща налична дата',
      desks: 'бюра',
      noAvailability: 'Няма налични бюра в следващите 10 дни. Моля, свържете се с нас директно за наличност.',
      loading: 'Проверяваме наличността...',
      buttonLoading: 'Проверяваме...',
      error: 'Грешка при проверка на наличността. Опитайте отново по-късно.'
    };
  } else {
    return {
      title: 'Next Available Date',
      desks: 'desks',
      noAvailability: 'No desks available in the next 10 days. Please contact us directly for availability.',
      loading: 'Checking availability...',
      buttonLoading: 'Checking...',
      error: 'Error checking availability. Please try again later.'
    };
  }
}

function generateAvailabilityHTML(availableDates) {
  const texts = getLocalizedTexts();
  let html = `<h4><i class="fas fa-calendar-alt"></i> ${texts.title}</h4>`;
  
  const nextWithDesks = availableDates.find(d => d.availableDesks > 0);
  
  if (nextWithDesks) {
    const deskClass = nextWithDesks.availableDesks >= 5 ? 'full' : nextWithDesks.availableDesks >= 1 ? 'limited' : 'none';
    html += `<div class="date-info">
      <span class="date">${formatDisplayDate(nextWithDesks.date)}</span>
      <span class="desks-count ${deskClass}">${nextWithDesks.availableDesks} / 8 ${texts.desks}</span>
    </div>`;
  } else {
    html += `<p style="color: var(--secondaryTextColor);">
      ${texts.noAvailability}
    </p>`;
  }
  
  return html;
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const currentPath = window.location.pathname;
  
  let locale = 'en-US';
  if (currentPath.includes('/ru/')) {
    locale = 'ru-RU';
  } else if (currentPath.includes('/ua/')) {
    locale = 'uk-UA';
  } else if (currentPath.includes('/bg/')) {
    locale = 'bg-BG';
  }
  
  return date.toLocaleDateString(locale, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Video autoplay fix for mobile devices (especially iOS)
function ensureVideoAutoplay() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  // Remove any existing play button first
  const existingButton = document.querySelector('.video-play-button');
  if (existingButton) {
    existingButton.remove();
  }

  // Ensure video attributes are set for iOS
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.defaultMuted = true;

  // Function to attempt video playback
  const attemptPlay = () => {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video autoplay started');
          // Remove play button if it exists
          const button = document.querySelector('.video-play-button');
          if (button) button.remove();
        })
        .catch(error => {
          console.log('Video autoplay failed:', error);
          // Only add play button if truly needed
          if (video.paused) {
            addPlayButton(video);
          }
        });
    }
  };

  // Try playing immediately
  attemptPlay();

  // iOS Safari needs user interaction - listen for first touch
  const handleFirstTouch = () => {
    if (video.paused) {
      video.play().then(() => {
        const button = document.querySelector('.video-play-button');
        if (button) button.remove();
      }).catch(console.error);
    }
  };

  document.addEventListener('touchstart', handleFirstTouch, { once: true });
  document.addEventListener('click', handleFirstTouch, { once: true });
}

// Separate function to add play button when needed
function addPlayButton(video) {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent || document.querySelector('.video-play-button')) return;

  const playButton = document.createElement('button');
  playButton.className = 'video-play-button';
  playButton.innerHTML = '<i class="fas fa-play-circle"></i>';
  playButton.setAttribute('aria-label', 'Play video');
  
  playButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    video.muted = true; // Ensure muted for iOS
    video.play().then(() => {
      playButton.remove();
    }).catch(error => {
      console.error('Play failed:', error);
      // Try once more with user gesture
      setTimeout(() => {
        video.play().then(() => {
          playButton.remove();
        });
      }, 100);
    });
  });
  
  heroContent.appendChild(playButton);
}

document.addEventListener('DOMContentLoaded', () => {
  initAvailabilityButton();
  ensureVideoAutoplay();
  
  // Also try on visibility change (when user switches tabs back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureVideoAutoplay();
    }
  });
});
