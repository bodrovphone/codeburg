/**
 * CODEBURG - MAIN JAVASCRIPT
 * High-Tech Interactive Coworking Experience
 * Incorporates OhMyDesk Live Booking API, Ambient Audio, Lightbox,
 * Real-time Burgas Clock, Bento Widgets & Micro-Interactions.
 */

// ============================================================================
// 1. Language-based redirection (only on English root)
// ============================================================================
try {
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const userLang = navigator.language;
      const langPrefix = userLang.split('-')[0].toLowerCase();
      
      if (typeof sessionStorage !== 'undefined') {
        try {
          if (!sessionStorage.getItem('redirected')) {
            sessionStorage.setItem('redirected', 'true');
            const supportedLangs = {
              'bg': '/bg/',
              'ru': '/ru/',
              'uk': '/ua/'
            };
            if (typeof langPrefix === 'string' && supportedLangs[langPrefix]) {
              window.location.href = supportedLangs[langPrefix];
            }
          }
        } catch (storageError) {
          console.warn('Session storage access error:', storageError);
        }
      }
    }
  }
} catch (error) {
  console.warn('Language detection error:', error);
}

// ============================================================================
// 2. Navigation & Mobile Menu Behavior
// ============================================================================
function initNavigation() {
  const mainNav = document.querySelector('.main-nav');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const sectionLinks = document.querySelector('.section-links');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');

  // Navbar glass blur intensity on scroll + Scroll progress
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (mainNav) {
      if (scrollY > 40) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }
    }

    if (scrollProgress && docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      scrollProgress.style.width = `${progress}%`;
    }

    if (backToTop) {
      if (scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  // Mobile menu toggle
  if (mobileToggle && sectionLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sectionLinks.classList.toggle('mobile-open');
      const isOpen = sectionLinks.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close when clicking link
    sectionLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sectionLinks.classList.remove('mobile-open');
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!sectionLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        sectionLinks.classList.remove('mobile-open');
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }

  // Back to top
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ============================================================================
// 2b. Language Switcher (Click Toggle, Outside Click Dismissal, Session Preservation)
// ============================================================================
function initLanguageSwitcher() {
  const switchers = document.querySelectorAll('.language-switcher');
  if (!switchers.length) return;

  switchers.forEach(switcher => {
    const btn = switcher.querySelector('.language-button');
    const dropdown = switcher.querySelector('.language-dropdown');
    if (!btn || !dropdown) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = switcher.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Save manual choice in sessionStorage when clicking a language link
    const langLinks = dropdown.querySelectorAll('a');
    langLinks.forEach(link => {
      link.addEventListener('click', () => {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('redirected', 'true');
          }
        } catch (e) {
          // ignore
        }
      });
    });
  });

  // Close when clicking anywhere outside
  document.addEventListener('click', (e) => {
    switchers.forEach(switcher => {
      if (switcher.classList.contains('is-open') && !switcher.contains(e.target)) {
        switcher.classList.remove('is-open');
        const btn = switcher.querySelector('.language-button');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      switchers.forEach(switcher => {
        if (switcher.classList.contains('is-open')) {
          switcher.classList.remove('is-open');
          const btn = switcher.querySelector('.language-button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
}

// ============================================================================
// 3. Real-Time Burgas Clock (EET / EEST)
// ============================================================================
function initBurgasClock() {
  const clockElements = document.querySelectorAll('.bento-live-time-val, #nav-clock-val');
  if (!clockElements.length) return;

  function updateClock() {
    try {
      const now = new Date();
      // Format to Europe/Sofia local time
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Sofia',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      clockElements.forEach(el => {
        el.textContent = timeStr;
      });
    } catch (e) {
      // Fallback
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      clockElements.forEach(el => {
        el.textContent = `${h}:${m}:${s}`;
      });
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ============================================================================
// 4. Mouse Cursor Spotlight Effect (Cards & Buttons)
// ============================================================================
function initSpotlightGlow() {
  const targets = document.querySelectorAll('.bento-card, .pricing-card, .faq-item, .contact-btn, .stay-calc-box');
  
  targets.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ============================================================================
// 5. Interactive Sit / Stand Desk Height Widget
// ============================================================================
function initDeskWidget() {
  const deskButtons = document.querySelectorAll('.desk-toggle-btn');
  const deskVisual = document.querySelector('.desk-mini-visual');
  const heightText = document.querySelector('.desk-height-text');

  if (!deskButtons.length || !deskVisual) return;

  deskButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deskButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      
      if (mode === 'stand') {
        deskVisual.classList.add('stand');
        if (heightText) heightText.textContent = '108 cm (Standing)';
      } else {
        deskVisual.classList.remove('stand');
        if (heightText) heightText.textContent = '73 cm (Sitting)';
      }
    });
  });
}

// ============================================================================
// 6. Interactive Stay Duration Calculator
// ============================================================================
function initStayCalculator() {
  const slider = document.getElementById('stay-slider');
  const daysValue = document.getElementById('stay-days-count');
  const recPlan = document.getElementById('stay-rec-plan');
  const pricingCards = document.querySelectorAll('.pricing-card');

  if (!slider || !daysValue) return;

  function updateCalculator() {
    const days = parseInt(slider.value, 10);
    daysValue.textContent = `${days} ${days === 1 ? 'day' : 'days'}`;

    pricingCards.forEach(c => c.classList.remove('calc-highlight'));

    let recommended = 'Day Pass';
    let cardIdx = 0; // Day pass

    if (days >= 16) {
      recommended = 'Full Month Pass (130€) — Best Value!';
      cardIdx = 3; // Monthly
    } else if (days >= 8) {
      recommended = 'Flex Desk 10-Day (75€)';
      cardIdx = 2; // Flex
    } else if (days >= 4) {
      recommended = 'Weekly Pass (40€)';
      cardIdx = 1; // Week
    } else {
      recommended = `Daily Pass (${days * 10}€ total)`;
      cardIdx = 0; // Day
    }

    if (recPlan) recPlan.innerHTML = `Recommended: <strong>${recommended}</strong>`;
    if (pricingCards[cardIdx]) {
      pricingCards[cardIdx].classList.add('calc-highlight');
    }
  }

  slider.addEventListener('input', updateCalculator);
  updateCalculator();
}

// ============================================================================
// 7. Interactive Lightbox Modal (Gallery)
// ============================================================================
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  if (!galleryItems.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption-text');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentIndex = 0;
  const itemsData = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption')?.textContent || 'CodeBurg Coworking';
    return {
      src: img?.src || '',
      caption: caption
    };
  });

  function showImage(index) {
    if (index < 0) index = itemsData.length - 1;
    if (index >= itemsData.length) index = 0;
    currentIndex = index;

    lightboxImg.src = itemsData[currentIndex].src;
    if (lightboxCaption) lightboxCaption.textContent = itemsData[currentIndex].caption;
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${itemsData.length}`;
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      showImage(idx);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

// ============================================================================
// 8. Interactive FAQ with Instant Live Search
// ============================================================================
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faq-search');

  // Accordion toggle
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question') || item.querySelector('h3');
    if (question) {
      question.addEventListener('click', () => {
        const wasActive = item.classList.contains('active');
        // Close others for clean accordion feel
        faqItems.forEach(other => other.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
      });
    }
  });

  // Instant live search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = 'block';
          if (query) item.classList.add('active'); // auto-expand matching
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

// ============================================================================
// 9. Copy Address to Clipboard with Toast Notification
// ============================================================================
function initCopyAddress() {
  const copyBtns = document.querySelectorAll('.hud-copy-btn, .copy-address-action');
  const toast = document.getElementById('copy-toast');
  const addressText = "CodeBurg Coworking Space, ul. Peyo K. Yavorov 1, Burgas 8000, Bulgaria";

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(addressText);
        showToast("✓ Address copied to clipboard!");
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = addressText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast("✓ Address copied!");
      }
    });
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

// ============================================================================
// 10. Focus Ambience Synthesizer (Web Audio API Ocean/Rain Easter Egg!)
// ============================================================================
function initAudioAmbience() {
  const toggleBtn = document.getElementById('ambience-toggle');
  if (!toggleBtn) return;

  let audioCtx = null;
  let noiseNode = null;
  let filterNode = null;
  let gainNode = null;
  let isPlaying = false;

  function createNoiseGenerator() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();

    // Create 5 seconds pink/brown noise buffer for ocean surf
    const bufferSize = audioCtx.sampleRate * 5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Low pass filter with gentle LFO modulation for ocean waves
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(320, audioCtx.currentTime);

    // Subtle wave LFO
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime); // 8-second wave period
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(180, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filterNode.frequency);
    lfo.start();

    // Master volume gain
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 1.5);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  }

  toggleBtn.addEventListener('click', () => {
    if (!isPlaying) {
      try {
        if (!audioCtx) {
          createNoiseGenerator();
        } else if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        isPlaying = true;
        toggleBtn.classList.add('playing');
        toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> <span>Ocean Ambience: ON</span>';
      } catch (err) {
        console.warn('Audio ambience failed to start:', err);
      }
    } else {
      if (gainNode && audioCtx) {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          if (audioCtx.state === 'running') audioCtx.suspend();
        }, 500);
      }
      isPlaying = false;
      toggleBtn.classList.remove('playing');
      toggleBtn.innerHTML = '<i class="fas fa-headphones"></i> <span>Focus Ambience</span>';
    }
  });
}

// ============================================================================
// 11. OhMyDesk Real-Time Availability Integration
// ============================================================================
const OHMYDESK_AVAILABILITY_URL = 'https://ohmydesk.app/api/v1/public/codeburg/availability';
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_MAX_DAYS_AHEAD = 14;

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

function isNonWorkingDay(dateString, workingDays, closedDates) {
  if (closedDates && closedDates.has(dateString)) return true;
  const jsDay = new Date(dateString + 'T00:00:00').getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return !workingDays.includes(isoDay);
}

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
    return body.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    return null;
  }
}

function unknownState() {
  return { status: 'unknown', dates: [], totalDesks: 0, windowDays: DEFAULT_MAX_DAYS_AHEAD };
}

async function getAvailabilityState() {
  try {
    const availability = await fetchAvailability();
    if (!availability) return unknownState();

    const deskIds = (availability.rooms || [])
      .flatMap(room => (room.desks || []).map(desk => desk.deskId));
    const totalDesks = deskIds.length;

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
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
      sessionStorage.removeItem('desk_availability');
      return null;
    }
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

function applyBookingCtaVisibility(state) {
  const show = state.status === 'available' || state.status === 'unknown';
  const ctas = document.querySelectorAll('.book-btn, .availability-book-btn');
  ctas.forEach(cta => { cta.hidden = !show; });
}

function renderSoldOutNotice(state, texts) {
  const resultDiv = document.getElementById('availability-result');
  if (!resultDiv || state.status !== 'none') return;
  resultDiv.className = 'availability-result show';
  resultDiv.innerHTML = generateAvailabilityHTML(state);
}

async function initAvailability() {
  const container = document.getElementById('hero-availability');
  const texts = getLocalizedTexts();

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
    if (state.status !== 'unknown') setCachedAvailability(state);
  }

  if (container) renderHeroAvailability(container, state, texts);
  applyBookingCtaVisibility(state);
  renderSoldOutNotice(state, texts);
}

function renderHeroAvailability(container, state, texts) {
  const nextWithDesks = state.dates.find(d => d.availableDesks > 0);

  if (state.status === 'unknown') {
    container.innerHTML = `<i class="fas fa-calendar-check"></i> <span class="hero-availability-text">${texts.heroFallback}</span>`;
  } else if (nextWithDesks) {
    const dateStr = formatShortDate(nextWithDesks.date);
    container.innerHTML = `<span class="availability-pulse-dot"></span> <span class="hero-availability-text">${texts.heroNext} <strong>${dateStr}</strong> (${nextWithDesks.availableDesks} free)</span>`;
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
      heroNext: 'Свободные места:',
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
      heroNext: 'Вільні місця:',
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
      heroNext: 'Свободни места:',
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
      heroNext: 'Available from:',
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
    return `<h4><i class="fas fa-calendar-alt"></i> ${texts.title}</h4>
    <div class="date-info">
      <span class="date">${formatDisplayDate(nextWithDesks.date)}</span>
      <span class="desks-count ${deskClass}">${nextWithDesks.availableDesks} / ${state.totalDesks} ${texts.desks}</span>
    </div>`;
  }

  return `<h4><i class="fas fa-calendar-times"></i> ${texts.soldOutTitle}</h4>
    <p style="color: var(--text-muted); margin-top: 0.5rem;">
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
    month: 'short',
    day: 'numeric'
  });
}

// ============================================================================
// 12. Video Autoplay Reliability
// ============================================================================
function ensureVideoAutoplay() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  const existingButton = document.querySelector('.video-play-button');
  if (existingButton) existingButton.remove();

  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.defaultMuted = true;

  const attemptPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          const button = document.querySelector('.video-play-button');
          if (button) button.remove();
        })
        .catch(() => {
          if (video.paused) addPlayButton(video);
        });
    }
  };

  attemptPlay();

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

function addPlayButton(video) {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent || document.querySelector('.video-play-button')) return;

  const playButton = document.createElement('button');
  playButton.className = 'video-play-button';
  playButton.innerHTML = '<i class="fas fa-play"></i>';
  playButton.setAttribute('aria-label', 'Play video background');
  
  playButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    video.muted = true;
    video.play().then(() => {
      playButton.remove();
    }).catch(console.error);
  });
  
  heroContent.appendChild(playButton);
}

// ============================================================================
// 12b. Custom On-Site Booking Dialog (Native OhMyDesk API Integration)
// ============================================================================
function initBookingDialog() {
  const dialog = document.getElementById('booking-dialog');
  if (!dialog) return;

  const frame = dialog.querySelector('.booking-dialog-frame');
  const closeBtn = document.getElementById('booking-dialog-close');
  const form = document.getElementById('custom-booking-form');
  const successView = document.getElementById('custom-booking-success');
  const successCloseBtn = document.getElementById('success-close-btn');
  const dateInput = document.getElementById('custom-booking-date');
  const availBadge = document.getElementById('booking-date-avail-badge');
  const alertBox = document.getElementById('custom-booking-alert');
  const submitBtn = document.getElementById('custom-booking-submit');
  const submitSpinner = submitBtn ? submitBtn.querySelector('.submit-spinner') : null;
  const submitText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const totalDisplay = document.getElementById('booking-summary-total');
  const metaDisplay = document.getElementById('booking-summary-meta');

  const currentPath = window.location.pathname;
  const lang = currentPath.includes('/bg/') ? 'bg' : currentPath.includes('/ru/') ? 'ru' : currentPath.includes('/ua/') ? 'ua' : 'en';

  const planConfigs = {
    day: {
      price: '10€',
      meta: {
        en: 'Pay with card or cash upon check-in',
        bg: 'Плащане с карта или в брой при настаняване',
        ru: 'Оплата картой или наличными при визите',
        ua: 'Оплата карткою або готівкою при візиті'
      },
      name: {
        en: 'Daily Pass',
        bg: 'Дневен абонамент',
        ru: 'Дневной абонемент',
        ua: 'Денний абонемент'
      }
    },
    week: {
      price: '40€',
      meta: {
        en: '🔑 Personal 24/7 RFID key included',
        bg: '🔑 Включен личен 24/7 RFID ключ',
        ru: '🔑 Персональный RFID-ключ 24/7 включен',
        ua: '🔑 Персональний RFID-ключ 24/7 включено'
      },
      name: {
        en: 'Weekly Pass',
        bg: 'Седмичен абонамент',
        ru: 'Недельный тариф',
        ua: 'Тижневий тариф'
      }
    },
    flex: {
      price: '75€',
      meta: {
        en: 'Any 10 business days within 6 months',
        bg: 'Всеки 10 работни дни за 6 месеца',
        ru: 'Любые 10 рабочих дней на 6 месяцев',
        ua: 'Будь-які 10 робочих днів на 6 місяців'
      },
      name: {
        en: 'Flex Desk',
        bg: 'Flex Бюро',
        ru: 'Flex Стол',
        ua: 'Flex Стіл'
      }
    },
    month: {
      price: '130€',
      meta: {
        en: '🔑 24/7 Dedicated workstation & RFID key',
        bg: '🔑 24/7 Собствено работно място и ключ',
        ru: '🔑 24/7 Закрепленное место и ключ',
        ua: '🔑 24/7 Закріплене місце та ключ'
      },
      name: {
        en: 'Full Month',
        bg: 'Месечен абонамент',
        ru: 'Полный месяц',
        ua: 'Повний місяць'
      }
    }
  };

  const errorMessages = {
    no_desks_available: {
      en: 'No desks available on this date. Please pick another date.',
      bg: 'Няма свободни бюра за тази дата. Моля, изберете друга дата.',
      ru: 'На эту дату нет свободных столов. Пожалуйста, выберите другую дату.',
      ua: 'На цю дату немає вільних столів. Будь ласка, оберіть іншу дату.'
    },
    missing_visitor_name: {
      en: 'Please enter your name.',
      bg: 'Моля, въведете вашето име.',
      ru: 'Пожалуйста, укажите ваше имя.',
      ua: 'Будь ласка, введіть ваше ім\'я.'
    },
    date_out_of_range: {
      en: 'Selected date is outside the 14-day bookable window.',
      bg: 'Избраната дата е извън 14-дневния период за резервация.',
      ru: 'Выбранная дата выходит за рамки 14-дневного окна.',
      ua: 'Обрана дата виходить за межі 14-денного вікна.'
    },
    generic: {
      en: 'Failed to confirm booking. Please try again or reach out on Telegram.',
      bg: 'Неуспешна резервация. Опитайте отново или ни пишете в Telegram.',
      ru: 'Не удалось забронировать. Попробуйте снова или напишите в Telegram.',
      ua: 'Не вдалося забронювати. Спробуйте ще раз або напишіть у Telegram.'
    }
  };

  function getSofiaTodayString() {
    const now = new Date();
    // Sofia is UTC+2 or UTC+3
    const str = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Sofia' });
    return str; // Returns YYYY-MM-DD
  }

  function getSelectedPlan() {
    const checked = form ? form.querySelector('input[name="booking_plan"]:checked') : null;
    return checked ? checked.value : 'day';
  }

  function setSelectedPlan(planKey) {
    if (!form) return;
    const radio = form.querySelector(`input[name="booking_plan"][value="${planKey}"]`);
    if (radio) {
      radio.checked = true;
    }
    updatePlanSummary();
  }

  function updatePlanSummary() {
    const planKey = getSelectedPlan();
    const config = planConfigs[planKey] || planConfigs.day;
    if (totalDisplay) totalDisplay.textContent = config.price;
    if (metaDisplay) metaDisplay.textContent = config.meta[lang] || config.meta.en;
  }

  function updateDateBadge(dateVal) {
    if (!availBadge) return;
    if (!dateVal) {
      availBadge.textContent = '—';
      availBadge.className = 'booking-avail-pill checking';
      return;
    }

    const state = getCachedAvailability();
    if (state && Array.isArray(state.dates)) {
      const dayEntry = state.dates.find(d => d.date === dateVal);
      if (dayEntry) {
        if (dayEntry.availableDesks > 0) {
          const deskWord = dayEntry.availableDesks === 1
            ? (lang === 'en' ? 'desk' : lang === 'bg' ? 'бюро' : 'стол')
            : (lang === 'en' ? 'desks' : lang === 'bg' ? 'бюра' : lang === 'ua' ? 'столи' : 'стола');
          availBadge.textContent = `🟢 ${dayEntry.availableDesks} ${deskWord}`;
          availBadge.className = 'booking-avail-pill';
          return;
        } else {
          availBadge.textContent = lang === 'en' ? '🔴 Full' : lang === 'bg' ? '🔴 Заето' : '🔴 Занято';
          availBadge.className = 'booking-avail-pill full';
          return;
        }
      }
    }

    // Check if weekend
    const jsDay = new Date(dateVal + 'T12:00:00').getDay();
    if (jsDay === 0 || jsDay === 6) {
      availBadge.textContent = lang === 'en' ? '⚠️ Weekend (24/7 Key)' : lang === 'bg' ? '⚠️ Уикенд (24/7 ключ)' : '⚠️ Выходной (24/7)';
      availBadge.className = 'booking-avail-pill full';
    } else {
      availBadge.textContent = lang === 'en' ? '✓ Open' : lang === 'bg' ? '✓ Отворено' : '✓ Доступно';
      availBadge.className = 'booking-avail-pill';
    }
  }

  function openBookingDialog(preferredPlan) {
    if (alertBox) {
      alertBox.hidden = true;
      alertBox.textContent = '';
    }

    if (form) form.hidden = false;
    if (successView) successView.hidden = true;

    // Set plan
    if (preferredPlan && planConfigs[preferredPlan]) {
      setSelectedPlan(preferredPlan);
    } else {
      updatePlanSummary();
    }

    // Setup date picker
    const todayStr = getSofiaTodayString();
    if (dateInput) {
      dateInput.min = todayStr;

      // Find first available day
      const state = getCachedAvailability();
      let bestDate = todayStr;
      if (state && Array.isArray(state.dates)) {
        const firstAvail = state.dates.find(d => d.availableDesks > 0 && d.date >= todayStr);
        if (firstAvail) bestDate = firstAvail.date;
      }

      if (!dateInput.value || dateInput.value < todayStr) {
        dateInput.value = bestDate;
      }
      updateDateBadge(dateInput.value);
    }

    // Open modal
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeBookingDialog() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    document.body.style.overflow = '';
  }

  // Intercept all booking triggers
  const bookingTriggers = document.querySelectorAll(
    '.book-btn, .availability-book-btn, .open-booking-dialog, .pricing-book-btn, a[href*="ohmydesk.app/book/"]'
  );

  bookingTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Extract plan preference from data-plan attribute
      const plan = btn.getAttribute('data-plan') ||
        (btn.closest('.pricing-card') && btn.closest('.pricing-card').getAttribute('data-plan')) ||
        'day';
      openBookingDialog(plan);
    });
  });

  // Radio plan change
  if (form) {
    form.querySelectorAll('input[name="booking_plan"]').forEach(radio => {
      radio.addEventListener('change', updatePlanSummary);
    });
  }

  // Date input change
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      updateDateBadge(dateInput.value);
    });
    dateInput.addEventListener('input', () => {
      updateDateBadge(dateInput.value);
    });
  }

  // Form submit -> Native OhMyDesk API POST
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (alertBox) {
        alertBox.hidden = true;
        alertBox.textContent = '';
      }

      const nameInput = document.getElementById('custom-booking-name');
      const emailInput = document.getElementById('custom-booking-email');
      const phoneInput = document.getElementById('custom-booking-phone');
      const notesInput = document.getElementById('custom-booking-notes');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const notesVal = notesInput ? notesInput.value.trim() : '';
      const dateVal = dateInput ? dateInput.value : '';
      const planVal = getSelectedPlan();
      const planConfig = planConfigs[planVal] || planConfigs.day;
      const planName = planConfig.name[lang] || planConfig.name.en;

      if (!nameVal) {
        if (alertBox) {
          alertBox.textContent = errorMessages.missing_visitor_name[lang] || errorMessages.missing_visitor_name.en;
          alertBox.hidden = false;
        }
        if (nameInput) nameInput.focus();
        return;
      }

      if (!dateVal) {
        if (alertBox) {
          alertBox.textContent = errorMessages.date_out_of_range[lang] || errorMessages.date_out_of_range.en;
          alertBox.hidden = false;
        }
        if (dateInput) dateInput.focus();
        return;
      }

      // Enter loading state
      if (submitBtn) submitBtn.disabled = true;
      if (submitSpinner) submitSpinner.hidden = false;

      const idempotencyKey = `codeburg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        dates: [dateVal],
        visitorName: nameVal,
        visitorEmail: emailVal || undefined,
        visitorPhone: phoneVal || undefined,
        notes: `Plan: ${planName} (${planConfig.price}). ${notesVal}`.trim()
      };

      try {
        const response = await fetch('https://ohmydesk.app/api/v1/public/codeburg/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 201 && result.data && Array.isArray(result.data.bookings) && result.data.bookings.length > 0) {
          const booking = result.data.bookings[0];
          const deskLabel = booking.deskLabel || 'Desk assigned';

          // Populate success card
          const deskLabelEl = document.getElementById('success-desk-label');
          const dateValEl = document.getElementById('success-date-val');
          const planValEl = document.getElementById('success-plan-val');

          if (deskLabelEl) deskLabelEl.textContent = deskLabel;
          if (dateValEl) dateValEl.textContent = dateVal;
          if (planValEl) planValEl.textContent = `${planName} (${planConfig.price})`;

          // Transition to success screen
          form.hidden = true;
          if (successView) successView.hidden = false;

          // Clear availability cache to reflect newly booked slot
          sessionStorage.removeItem('desk_availability');
        } else {
          // Display structured API error
          const errCode = (result.error && result.error.code) || '';
          const errMsg = (result.error && result.error.message) || '';
          const localizedErr = (errorMessages[errCode] && errorMessages[errCode][lang]) ||
            errMsg ||
            errorMessages.generic[lang] ||
            errorMessages.generic.en;

          if (alertBox) {
            alertBox.textContent = localizedErr;
            alertBox.hidden = false;
          }
        }
      } catch (err) {
        console.error('Booking submission error:', err);
        if (alertBox) {
          alertBox.textContent = errorMessages.generic[lang] || errorMessages.generic.en;
          alertBox.hidden = false;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitSpinner) submitSpinner.hidden = true;
      }
    });
  }

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeBookingDialog);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeBookingDialog);

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  dialog.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  // Light dismiss on backdrop click
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      closeBookingDialog();
    }
  });
}

// ============================================================================
// 13. DOM Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguageSwitcher();
  initBurgasClock();
  initSpotlightGlow();
  initDeskWidget();
  initStayCalculator();
  initGalleryLightbox();
  initFaq();
  initCopyAddress();
  initAudioAmbience();
  initAvailability();
  initAvailabilityButton();
  initBookingDialog();
  ensureVideoAutoplay();
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureVideoAutoplay();
  });
});
