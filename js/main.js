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

// Desk availability via the OhMyDesk public API.
// No keys and no direct database access — the desk list and booked days come
// straight from the space's live data. (Migrated off the raw Supabase table +
// anon key that used to live here.)
const OHMYDESK_AVAILABILITY_URL = 'https://ohmydesk.app/api/v1/public/codeburg/availability';

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

async function fetchAvailability() {
  try {
    const response = await fetch(OHMYDESK_AVAILABILITY_URL, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();
    // { data: { org, rooms: [{ desks: [{ deskId }] }], bookedSlots: [{ deskId, date }], ... } }
    return body.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
}

async function getNextAvailableDates() {
  try {
    const availability = await fetchAvailability();
    if (!availability) return [];

    // The real desk list, straight from the space (no hardcoded assumptions).
    const deskIds = (availability.rooms || [])
      .flatMap(room => (room.desks || []).map(desk => desk.deskId));
    const totalDesks = deskIds.length;

    // Booked desk ids grouped by date.
    const bookedByDate = new Map();
    for (const slot of (availability.bookedSlots || [])) {
      if (!bookedByDate.has(slot.date)) bookedByDate.set(slot.date, new Set());
      bookedByDate.get(slot.date).add(slot.deskId);
    }

    return generateDatesForNext10Days().map(date => {
      const booked = bookedByDate.get(date);
      const availableDesks = booked
        ? deskIds.filter(id => !booked.has(id)).length
        : totalDesks;
      return { date, availableDesks };
    });
  } catch (error) {
    console.error('Error calculating available dates:', error);
    return [];
  }
}

window.DeskAvailability = {
  getNextAvailableDates,
  fetchAvailability
};

function isBotOrNoStorage() {
  // Check if sessionStorage exists (bots/crawlers typically lack it)
  try {
    sessionStorage.setItem('__bot_check', '1');
    sessionStorage.removeItem('__bot_check');
  } catch (e) {
    return true;
  }
  return false;
}

function getCachedAvailability() {
  try {
    const cached = sessionStorage.getItem('desk_availability');
    if (!cached) return null;
    const data = JSON.parse(cached);
    // Cache valid for 15 minutes
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
      sessionStorage.removeItem('desk_availability');
      return null;
    }
    return data.result;
  } catch (e) {
    return null;
  }
}

function setCachedAvailability(result) {
  try {
    sessionStorage.setItem('desk_availability', JSON.stringify({
      result: result,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore storage errors
  }
}

async function initHeroAvailability() {
  const container = document.getElementById('hero-availability');
  if (!container) return;

  const texts = getLocalizedTexts();

  // Bot/crawler prevention
  if (isBotOrNoStorage()) {
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroFallback}</span>`;
    container.classList.add('loaded');
    return;
  }

  // Check cache first
  const cached = getCachedAvailability();
  if (cached) {
    renderHeroAvailability(container, cached, texts);
    return;
  }

  // Fetch fresh data
  try {
    const availableDates = await getNextAvailableDates();
    setCachedAvailability(availableDates);
    renderHeroAvailability(container, availableDates, texts);
  } catch (error) {
    console.error('Hero availability error:', error);
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroFallback}</span>`;
    container.classList.add('loaded');
  }
}

function renderHeroAvailability(container, availableDates, texts) {
  const nextWithDesks = availableDates.find(d => d.availableDesks > 0);

  if (nextWithDesks) {
    const dateStr = formatShortDate(nextWithDesks.date);
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroNext} <strong>${dateStr}</strong></span>`;
  } else {
    container.innerHTML = `<i class="fas fa-calendar-times"></i> <span class="hero-availability-text">${texts.heroNone}</span>`;
  }
  container.classList.add('loaded');
}

function initAvailabilityButton() {
  const button = document.getElementById('check-availability-btn');
  const resultDiv = document.getElementById('availability-result');

  if (!button || !resultDiv) return;

  const originalButtonHTML = button.innerHTML;

  button.addEventListener('click', async function() {
    const texts = getLocalizedTexts();

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
      error: 'Ошибка при проверке наличия. Попробуйте позже.',
      heroNext: 'Ближайшее свободное место:',
      heroNone: 'Нет свободных мест на ближайшие дни',
      heroFallback: 'Свяжитесь с нами для проверки наличия мест'
    };
  } else if (currentPath.includes('/ua/')) {
    return {
      title: 'Наступна доступна дата',
      desks: 'столів',
      noAvailability: 'Немає доступних столів у найближчі 10 днів. Будь ласка, зв\'яжіться з нами безпосередньо для уточнення наявності.',
      loading: 'Перевіряємо наявність...',
      buttonLoading: 'Перевіряємо...',
      error: 'Помилка при перевірці наявності. Спробуйте пізніше.',
      heroNext: 'Найближче вільне місце:',
      heroNone: 'Немає вільних місць на найближчі дні',
      heroFallback: 'Зв\'яжіться з нами для перевірки наявності місць'
    };
  } else if (currentPath.includes('/bg/')) {
    return {
      title: 'Следваща налична дата',
      desks: 'бюра',
      noAvailability: 'Няма налични бюра в следващите 10 дни. Моля, свържете се с нас директно за наличност.',
      loading: 'Проверяваме наличността...',
      buttonLoading: 'Проверяваме...',
      error: 'Грешка при проверка на наличността. Опитайте отново по-късно.',
      heroNext: 'Следващото свободно място:',
      heroNone: 'Няма свободни места за следващите дни',
      heroFallback: 'Свържете се с нас за проверка на наличността'
    };
  } else {
    return {
      title: 'Next Available Date',
      desks: 'desks',
      noAvailability: 'No desks available in the next 10 days. Please contact us directly for availability.',
      loading: 'Checking availability...',
      buttonLoading: 'Checking...',
      error: 'Error checking availability. Please try again later.',
      heroNext: 'Next available desk:',
      heroNone: 'No desks available for the coming days',
      heroFallback: 'Contact us to check desk availability'
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

function formatShortDate(dateString) {
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
  initHeroAvailability();
  initAvailabilityButton();
  ensureVideoAutoplay();
  
  // Also try on visibility change (when user switches tabs back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureVideoAutoplay();
    }
  });
});
