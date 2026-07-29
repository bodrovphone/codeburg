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
// No keys and no direct database access — the desk list, booked days and the
// space's own calendar rules (working days, closure dates, booking horizon)
// come straight from the space's live data. (Migrated off the raw Supabase
// table + anon key that used to live here.)
const OHMYDESK_AVAILABILITY_URL = 'https://ohmydesk.app/api/v1/public/codeburg/availability';

// Fallbacks only — the real values come from the API's `org` block.
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // ISO weekdays: 1=Mon … 7=Sun
const DEFAULT_MAX_DAYS_AHEAD = 14;

// Local calendar date. Deliberately NOT toISOString(), which converts to UTC
// and reports the wrong day for any visitor whose local date differs from
// UTC's — e.g. Europe/Sofia between local midnight and 03:00.
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function closureDatesToSet(closureDates) {
  const out = new Set();
  for (const entry of closureDates || []) {
    const date = entry && typeof entry.date === 'string' ? entry.date.trim() : '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) out.add(date);
  }
  return out;
}

// Mirrors isNonWorkingDay() in the OhMyDesk client, so this page and the hosted
// booking page agree on which days a visitor can actually book. A closure date
// carries no bookings (nobody can book a closed day), so without this check the
// naive "free desks" math reads a vacation day as completely available.
function isNonWorkingDay(dateString, workingDays, closedDates) {
  if (closedDates && closedDates.has(dateString)) return true;
  const jsDay = new Date(dateString + 'T00:00:00').getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return !workingDays.includes(isoDay);
}

// Every day inside the space's booking horizon that a visitor could book.
function generateBookableDates(org) {
  const workingDays = Array.isArray(org && org.workingDays) && org.workingDays.length
    ? org.workingDays
    : DEFAULT_WORKING_DAYS;
  const closedDates = closureDatesToSet(org && org.closureDates);
  const horizon = (org && org.maxDaysAhead) || DEFAULT_MAX_DAYS_AHEAD;

  const dates = [];
  const today = new Date();

  for (let i = 0; i < horizon; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateString = formatDate(currentDate);

    if (!isNonWorkingDay(dateString, workingDays, closedDates)) {
      dates.push(dateString);
    }
  }

  return { dates: dates, horizon: horizon };
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

function unknownState() {
  return { status: 'unknown', dates: [], totalDesks: 0, windowDays: DEFAULT_MAX_DAYS_AHEAD };
}

// Resolves to { status, dates, totalDesks, windowDays }, where status is:
//   'available' — at least one bookable day still has a free desk
//   'none'      — the space is genuinely full across the whole horizon
//   'unknown'   — the API failed, so we must not claim either way
async function getAvailabilityState() {
  try {
    const availability = await fetchAvailability();
    if (!availability) return unknownState();

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

    const bookingWindow = generateBookableDates(availability.org || {});
    const dates = bookingWindow.dates.map(date => {
      const booked = bookedByDate.get(date);
      const availableDesks = booked
        ? deskIds.filter(id => !booked.has(id)).length
        : totalDesks;
      return { date, availableDesks };
    });

    return {
      status: dates.some(d => d.availableDesks > 0) ? 'available' : 'none',
      dates: dates,
      totalDesks: totalDesks,
      windowDays: bookingWindow.horizon,
    };
  } catch (error) {
    console.error('Error calculating available dates:', error);
    return unknownState();
  }
}

async function getNextAvailableDates() {
  return (await getAvailabilityState()).dates;
}

window.DeskAvailability = {
  getNextAvailableDates,
  getAvailabilityState,
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
    // Ignore entries written before `result` became a state object.
    if (!data.result || typeof data.result !== 'object' || Array.isArray(data.result)) {
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

// The booking CTAs point at the OhMyDesk booking page. They ship `hidden` in
// the markup and are only ever revealed once we have a reason to: a visitor
// should never see a booking link flash up and then vanish.
//
// 'unknown' (API unreachable) also reveals them — an outage is not the same as
// being full, and must not silently remove the booking path.
function applyBookingCtaVisibility(state) {
  const show = state.status === 'available' || state.status === 'unknown';
  const ctas = document.querySelectorAll('.book-btn, .availability-book-btn');
  ctas.forEach(cta => { cta.hidden = !show; });
}

// When the space is full, say so in the availability section too — otherwise
// hiding the booking button just leaves an unexplained gap.
function renderSoldOutNotice(state, texts) {
  const resultDiv = document.getElementById('availability-result');
  if (!resultDiv || state.status !== 'none') return;
  resultDiv.className = 'availability-result show';
  resultDiv.innerHTML = generateAvailabilityHTML(state);
}

async function initAvailability() {
  const container = document.getElementById('hero-availability');
  const texts = getLocalizedTexts();

  // Bot/crawler prevention: skip the API call entirely. The CTAs ship hidden,
  // so reveal them explicitly here — otherwise crawlers and browsers without
  // sessionStorage would never see the booking link at all.
  if (isBotOrNoStorage()) {
    if (container) {
      container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroFallback}</span>`;
      container.classList.add('loaded');
    }
    applyBookingCtaVisibility(unknownState());
    return;
  }

  let state = getCachedAvailability();
  if (!state) {
    state = await getAvailabilityState();
    // Never cache an outage — the next page view should retry.
    if (state.status !== 'unknown') setCachedAvailability(state);
  }

  if (container) renderHeroAvailability(container, state, texts);
  applyBookingCtaVisibility(state);
  renderSoldOutNotice(state, texts);
}

function renderHeroAvailability(container, state, texts) {
  const nextWithDesks = state.dates.find(d => d.availableDesks > 0);

  if (state.status === 'unknown') {
    // The API is unreachable. Don't tell visitors we're full when we don't know.
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroFallback}</span>`;
  } else if (nextWithDesks) {
    const dateStr = formatShortDate(nextWithDesks.date);
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroNext} <strong>${dateStr}</strong></span>`;
  } else {
    const text = fillDays(texts.heroNone, state.windowDays);
    container.innerHTML = `<i class="fas fa-calendar-times"></i> <span class="hero-availability-text">${text}</span>`;
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
      const state = await getAvailabilityState();

      if (state.status === 'unknown') {
        resultDiv.className = 'availability-result show';
        resultDiv.innerHTML = `<p>${texts.error}</p>`;
        return;
      }

      // A manual check is the freshest signal we have — refresh cache and CTAs.
      setCachedAvailability(state);
      applyBookingCtaVisibility(state);

      resultDiv.className = 'availability-result show';
      resultDiv.innerHTML = generateAvailabilityHTML(state);

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

// Substitutes the real booking horizon into a message template.
function fillDays(template, days) {
  return template.replace('{days}', days);
}

function getLocalizedTexts() {
  const currentPath = window.location.pathname;

  if (currentPath.includes('/ru/')) {
    return {
      title: 'Следующая доступная дата',
      soldOutTitle: 'Все места заняты',
      desks: 'столов',
      noAvailability: 'Нет свободных столов на ближайшие {days} дней. Свяжитесь с нами — сообщим, как только место освободится.',
      loading: 'Проверяем наличие...',
      buttonLoading: 'Проверяем...',
      error: 'Ошибка при проверке наличия. Попробуйте позже.',
      heroNext: 'Ближайшее свободное место:',
      heroNone: 'Мест нет на ближайшие {days} дней',
      heroFallback: 'Свяжитесь с нами для проверки наличия мест'
    };
  } else if (currentPath.includes('/ua/')) {
    return {
      title: 'Наступна доступна дата',
      soldOutTitle: 'Усі місця зайняті',
      desks: 'столів',
      noAvailability: 'Немає вільних столів на найближчі {days} днів. Зв\'яжіться з нами — повідомимо, щойно місце звільниться.',
      loading: 'Перевіряємо наявність...',
      buttonLoading: 'Перевіряємо...',
      error: 'Помилка при перевірці наявності. Спробуйте пізніше.',
      heroNext: 'Найближче вільне місце:',
      heroNone: 'Місць немає на найближчі {days} днів',
      heroFallback: 'Зв\'яжіться з нами для перевірки наявності місць'
    };
  } else if (currentPath.includes('/bg/')) {
    return {
      title: 'Следваща налична дата',
      soldOutTitle: 'Няма свободни места',
      desks: 'бюра',
      noAvailability: 'Няма свободни бюра през следващите {days} дни. Свържете се с нас — ще ви уведомим веднага щом се освободи място.',
      loading: 'Проверяваме наличността...',
      buttonLoading: 'Проверяваме...',
      error: 'Грешка при проверка на наличността. Опитайте отново по-късно.',
      heroNext: 'Следващото свободно място:',
      heroNone: 'Няма свободни места през следващите {days} дни',
      heroFallback: 'Свържете се с нас за проверка на наличността'
    };
  } else {
    return {
      title: 'Next Available Date',
      soldOutTitle: 'Fully Booked',
      desks: 'desks',
      noAvailability: 'No desks available in the next {days} days. Get in touch — we\'ll let you know as soon as one frees up.',
      loading: 'Checking availability...',
      buttonLoading: 'Checking...',
      error: 'Error checking availability. Please try again later.',
      heroNext: 'Next available desk:',
      heroNone: 'Fully booked for the next {days} days',
      heroFallback: 'Contact us to check desk availability'
    };
  }
}

function generateAvailabilityHTML(state) {
  const texts = getLocalizedTexts();
  const nextWithDesks = state.dates.find(d => d.availableDesks > 0);

  if (nextWithDesks) {
    const deskClass = nextWithDesks.availableDesks >= 5 ? 'full' : nextWithDesks.availableDesks >= 1 ? 'limited' : 'none';
    // Total comes from the payload — adding a desk must not require a code change.
    return `<h4><i class="fas fa-calendar-alt"></i> ${texts.title}</h4>
    <div class="date-info">
      <span class="date">${formatDisplayDate(nextWithDesks.date)}</span>
      <span class="desks-count ${deskClass}">${nextWithDesks.availableDesks} / ${state.totalDesks} ${texts.desks}</span>
    </div>`;
  }

  return `<h4><i class="fas fa-calendar-times"></i> ${texts.soldOutTitle}</h4>
    <p style="color: var(--secondaryTextColor);">
      ${fillDays(texts.noAvailability, state.windowDays)}
    </p>`;
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
  initAvailability();
  initAvailabilityButton();
  ensureVideoAutoplay();
  
  // Also try on visibility change (when user switches tabs back)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureVideoAutoplay();
    }
  });
});
