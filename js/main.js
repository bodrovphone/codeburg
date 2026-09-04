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

  // Throttled scroll handling with requestAnimationFrame
  let scrollTicking = false;
  let cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  window.addEventListener('resize', () => {
    cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        if (mainNav) {
          if (scrollY > 40) {
            mainNav.classList.add('scrolled');
          } else {
            mainNav.classList.remove('scrolled');
          }
        }

        if (scrollProgress && cachedDocHeight > 0) {
          const progress = Math.min(100, Math.max(0, (scrollY / cachedDocHeight) * 100));
          scrollProgress.style.width = `${progress}%`;
        }

        if (backToTop) {
          if (scrollY > 500) {
            backToTop.classList.add('visible');
          } else {
            backToTop.classList.remove('visible');
          }
        }

        scrollTicking = false;
      });
      scrollTicking = true;
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
  let clockInterval = setInterval(updateClock, 1000);

  // Stop clock ticks when browser tab is inactive to preserve battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(clockInterval);
    } else {
      updateClock();
      clearInterval(clockInterval);
      clockInterval = setInterval(updateClock, 1000);
    }
  });
}

// ============================================================================
// 4. Performance & Viewport Intersection Management
// ============================================================================
function initPerformanceOptimizations() {
  // 1. Pause floating logo animation when scrolled out of view
  const heroSection = document.getElementById('hero');
  const heroLogo = document.querySelector('.hero-logo');

  if (heroSection && 'IntersectionObserver' in window && heroLogo) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroLogo.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.05 });

    heroObserver.observe(heroSection);
  }

  // 2. Pause live bandwidth animation when widget is not visible
  const speedFill = document.querySelector('.speed-bar-fill');
  if (speedFill && 'IntersectionObserver' in window) {
    const speedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        speedFill.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0.1 });

    speedObserver.observe(speedFill);
  }
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
// 12b. Custom On-Site Booking Dialog (Native OhMyDesk API Integration)
// ============================================================================
function initBookingDialog() {
  const dialog = document.getElementById('booking-dialog');
  if (!dialog) return;

  const closeBtn = document.getElementById('booking-dialog-close');
  const stepTracker = document.getElementById('booking-step-tracker');
  const stepBar1 = document.getElementById('step-bar-1');
  const stepBar2 = document.getElementById('step-bar-2');

  // Step 1: Date Selection
  const step1View = document.getElementById('booking-step-1');
  const quickDateToday = document.getElementById('quick-date-today');
  const quickDateTomorrow = document.getElementById('quick-date-tomorrow');
  const todayAvailSub = document.getElementById('today-avail-sub');
  const tomorrowAvailSub = document.getElementById('tomorrow-avail-sub');
  const twoDesksCheckbox = document.getElementById('booking-two-desks-checkbox');
  const twoDesksSpinner = document.getElementById('two-desks-spinner');
  const pickDateTrigger = document.getElementById('pick-date-trigger');
  const inlineCalendar = document.getElementById('booking-inline-calendar');
  const calMonthTitle = document.getElementById('cal-month-title');
  const calPrevMonth = document.getElementById('cal-prev-month');
  const calNextMonth = document.getElementById('cal-next-month');
  const calWeekdaysRow = document.getElementById('cal-weekdays-row');
  const calDaysGrid = document.getElementById('cal-days-grid');
  const calDoneBtn = document.getElementById('cal-done-btn');
  const step1Alert = document.getElementById('step1-alert');
  const step1ContinueBtn = document.getElementById('booking-step1-continue');
  const continueBtnText = document.getElementById('continue-btn-text');

  // Step 2: Details & Plan
  const step2Form = document.getElementById('custom-booking-form');
  const backBtn = document.getElementById('booking-back-to-step1');
  const step2DateDisplay = document.getElementById('step2-date-display');
  const step2PassTag = document.getElementById('step2-pass-tag');
  const step2PassTitle = document.getElementById('step2-pass-title');
  const step2UnitPrice = document.getElementById('step2-unit-price');
  const step2PriceUnit = document.getElementById('step2-price-unit');
  const step2Alert = document.getElementById('custom-booking-alert');
  const nameInput = document.getElementById('custom-booking-name');
  const emailInput = document.getElementById('custom-booking-email');
  const phoneInput = document.getElementById('custom-booking-phone');
  const notesInput = document.getElementById('custom-booking-notes');
  const submitBtn = document.getElementById('custom-booking-submit');
  const submitSpinner = submitBtn ? submitBtn.querySelector('.submit-spinner') : null;
  const totalDisplay = document.getElementById('booking-summary-total');
  const metaDisplay = document.getElementById('booking-summary-meta');
  const submitBtnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

  // Step 3: Success Confirmation
  const successView = document.getElementById('custom-booking-success');
  const successCloseBtn = document.getElementById('success-close-btn');
  const successDeskLabel = document.getElementById('success-desk-label');
  const successDateVal = document.getElementById('success-date-val');
  const successPlanVal = document.getElementById('success-plan-val');

  const currentPath = window.location.pathname;
  const lang = currentPath.includes('/bg/') ? 'bg' : currentPath.includes('/ru/') ? 'ru' : currentPath.includes('/ua/') ? 'ua' : 'en';

  // Date selection & desk count state
  let currentSelectedDate = null;
  let neededDesks = 1;

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

  const labels = {
    today: { en: 'Today', bg: 'Днес', ru: 'Сегодня', ua: 'Сьогодні' },
    tomorrow: { en: 'Tomorrow', bg: 'Утре', ru: 'Завтра', ua: 'Завтра' },
    checking: { en: 'Checking...', bg: 'Проверка...', ru: 'Проверка...', ua: 'Перевірка...' },
    desksLeft: (count, l) => {
      if (l === 'bg') return count === 1 ? '1 свободно бюро' : `${count} свободни бюра`;
      if (l === 'ru') return count === 1 ? '1 свободный стол' : count < 5 ? `${count} свободных стола` : `${count} свободных столов`;
      if (l === 'ua') return count === 1 ? '1 вільний стіл' : count < 5 ? `${count} вільні столи` : `${count} вільних столів`;
      return count === 1 ? '1 desk left' : `${count} desks left`;
    },
    insufficientDesks: {
      en: 'Only 1 desk left (need 2)',
      bg: 'Само 1 свободно бюро (трябват 2)',
      ru: 'Остался только 1 стол (нужно 2)',
      ua: 'Лишився лише 1 стіл (потрібно 2)'
    },
    soldOut: { en: 'Sold out', bg: 'Заето', ru: 'Занято', ua: 'Зайнято' },
    weekend: { en: 'Weekend (24/7 Key)', bg: 'Уикенд (24/7 ключ)', ru: 'Выходной (24/7)', ua: 'Вихідний (24/7)' },
    closed: { en: 'Closed', bg: 'Затворено', ru: 'Закрыто', ua: 'Зачинено' },
    weekendNotice: {
      en: 'Standard drop-ins are Mon–Fri. Weekend access is included with Weekly/Monthly 24/7 key memberships.',
      bg: 'Дневните посещения са Пон–Пет. Достъпът през уикенда е за седмични/месечни членове с 24/7 ключ.',
      ru: 'Дневные визиты: Пн–Пт. Доступ в выходные дни включен в недельные и месячные тарифы с 24/7 ключом.',
      ua: 'Денні візити: Пн–Пт. Доступ у вихідні дні включено в тижневі та місячні тарифи з 24/7 ключем.'
    },
    insufficientNotice: {
      en: 'Only 1 desk is available on this date, but 2 desks are required. Please pick another date.',
      bg: 'Има само 1 свободно бюро за тази дата, а са нужни 2. Моля, изберете друга дата.',
      ru: 'На эту дату доступен только 1 стол, а требуется 2. Пожалуйста, выберите другую дату.',
      ua: 'На цю дату доступний лише 1 стіл, а потрібно 2. Будь ласка, оберіть іншу дату.'
    },
    continueSelectDate: {
      en: 'Select a date to continue',
      bg: 'Изберете дата за продължаване',
      ru: 'Выберите дату для продолжения',
      ua: 'Оберіть дату для продовження'
    },
    continueWithDate: (dateStr, l) => {
      if (l === 'bg') return `Продължи с ${dateStr}`;
      if (l === 'ru') return `Продолжить на ${dateStr}`;
      if (l === 'ua') return `Продовжити на ${dateStr}`;
      return `Continue with ${dateStr}`;
    },
    passTag: (desks, l) => {
      if (desks === 2) {
        if (l === 'bg') return 'Дневен пропуск (2 бюра)';
        if (l === 'ru') return 'Дневной пропуск (2 стола)';
        if (l === 'ua') return 'Денний пропуск (2 столи)';
        return 'On-Site Pass (2 Desks)';
      }
      if (l === 'bg') return 'Дневен пропуск';
      if (l === 'ru') return 'Дневной пропуск';
      if (l === 'ua') return 'Денний пропуск';
      return 'On-Site Pass';
    },
    singleDeskMeta: {
      en: 'Pay with card or cash upon check-in',
      bg: 'Плащане с карта или в брой при настаняване',
      ru: 'Оплата картой или наличными при заселении',
      ua: 'Оплата карткою або готівкою при поселенні'
    },
    twoDesksMeta: (total, l) => {
      if (l === 'bg') return `2 бюра × 10€ = ${total}€ • Плащане на място`;
      if (l === 'ru') return `2 стола × 10€ = ${total}€ • Оплата на месте`;
      if (l === 'ua') return `2 столи × 10€ = ${total}€ • Оплата на місці`;
      return `2 desks × 10€ = ${total}€ • Pay on arrival`;
    },
    confirmBtn: (total, l) => {
      if (l === 'bg') return `Потвърди резервацията (${total}€)`;
      if (l === 'ru') return `Подтвердить бронирование (${total}€)`;
      if (l === 'ua') return `Підтвердити бронювання (${total}€)`;
      return `Confirm Desk Booking (${total}€)`;
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

  function getSofiaDateString(offsetDays = 0) {
    const now = new Date();
    const sofiaParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Sofia',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const y = parseInt(sofiaParts.find(p => p.type === 'year').value, 10);
    const m = parseInt(sofiaParts.find(p => p.type === 'month').value, 10) - 1;
    const d = parseInt(sofiaParts.find(p => p.type === 'day').value, 10);
    const sofiaDate = new Date(Date.UTC(y, m, d + offsetDays));
    return sofiaDate.toISOString().slice(0, 10);
  }

  function formatDisplayDate(dateStr, currentLang) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const locale = currentLang === 'bg' ? 'bg-BG' : currentLang === 'ru' ? 'ru-RU' : currentLang === 'ua' ? 'uk-UA' : 'en-US';
    return dateObj.toLocaleDateString(locale, {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function getDateAvailability(dateStr) {
    const state = getCachedAvailability();
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const jsDay = dateObj.getUTCDay(); // 0 = Sun, 6 = Sat
    const isWeekend = (jsDay === 0 || jsDay === 6);

    let availableDesks = isWeekend ? 0 : 4;
    let isKnown = false;

    if (state && Array.isArray(state.dates)) {
      const entry = state.dates.find(d => d.date === dateStr);
      if (entry) {
        isKnown = true;
        availableDesks = entry.availableDesks;
      }
    }

    const isFull = availableDesks <= 0;
    const isInsufficient = !isWeekend && availableDesks > 0 && availableDesks < neededDesks;
    const isEligible = !isWeekend && availableDesks >= neededDesks;

    return {
      isKnown,
      availableDesks,
      isWeekend,
      isFull,
      isInsufficient,
      isEligible
    };
  }

  function updateQuickDateCards() {
    const todayStr = getSofiaDateString(0);
    const tomorrowStr = getSofiaDateString(1);

    const todayAvail = getDateAvailability(todayStr);
    const tomorrowAvail = getDateAvailability(tomorrowStr);

    if (todayAvailSub) {
      if (todayAvail.isWeekend) {
        todayAvailSub.textContent = labels.weekend[lang] || labels.weekend.en;
        todayAvailSub.className = 'date-card-sub avail-limited';
      } else if (todayAvail.isFull) {
        todayAvailSub.textContent = labels.soldOut[lang] || labels.soldOut.en;
        todayAvailSub.className = 'date-card-sub avail-closed';
      } else if (todayAvail.isInsufficient) {
        todayAvailSub.textContent = labels.insufficientDesks[lang] || labels.insufficientDesks.en;
        todayAvailSub.className = 'date-card-sub avail-limited';
      } else {
        todayAvailSub.textContent = `🟢 ${labels.desksLeft(todayAvail.availableDesks, lang)}`;
        todayAvailSub.className = 'date-card-sub avail-open';
      }
    }

    if (tomorrowAvailSub) {
      if (tomorrowAvail.isWeekend) {
        tomorrowAvailSub.textContent = labels.weekend[lang] || labels.weekend.en;
        tomorrowAvailSub.className = 'date-card-sub avail-limited';
      } else if (tomorrowAvail.isFull) {
        tomorrowAvailSub.textContent = labels.soldOut[lang] || labels.soldOut.en;
        tomorrowAvailSub.className = 'date-card-sub avail-closed';
      } else if (tomorrowAvail.isInsufficient) {
        tomorrowAvailSub.textContent = labels.insufficientDesks[lang] || labels.insufficientDesks.en;
        tomorrowAvailSub.className = 'date-card-sub avail-limited';
      } else {
        tomorrowAvailSub.textContent = `🟢 ${labels.desksLeft(tomorrowAvail.availableDesks, lang)}`;
        tomorrowAvailSub.className = 'date-card-sub avail-open';
      }
    }

    if (quickDateToday) {
      quickDateToday.classList.toggle('selected', currentSelectedDate === todayStr);
      quickDateToday.disabled = !todayAvail.isEligible;
    }
    if (quickDateTomorrow) {
      quickDateTomorrow.classList.toggle('selected', currentSelectedDate === tomorrowStr);
      quickDateTomorrow.disabled = !tomorrowAvail.isEligible;
    }
  }

  // Calendar configuration and state
  const calWeekdays = {
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    bg: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    ua: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
  };

  let calViewYear = null;
  let calViewMonth = null;

  function formatCalMonthTitle(year, monthIndex, currentLang) {
    const dateObj = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
    const locale = currentLang === 'bg' ? 'bg-BG' : currentLang === 'ru' ? 'ru-RU' : currentLang === 'ua' ? 'uk-UA' : 'en-US';
    const monthName = dateObj.toLocaleDateString(locale, { timeZone: 'UTC', month: 'long' });
    const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `${capMonth} ${year}`;
  }

  function updateCalendarSelection() {
    if (!calDaysGrid) return;
    const cells = calDaysGrid.querySelectorAll('.cal-day-cell');
    cells.forEach(cell => {
      const d = cell.getAttribute('data-date');
      if (d === currentSelectedDate) {
        cell.classList.add('selected');
        cell.setAttribute('aria-selected', 'true');
      } else {
        cell.classList.remove('selected');
        cell.removeAttribute('aria-selected');
      }
    });
  }

  function renderCalendar(year, month) {
    if (!inlineCalendar || !calDaysGrid || !calMonthTitle) return;

    calViewYear = year;
    calViewMonth = month;

    calMonthTitle.textContent = formatCalMonthTitle(year, month, lang);

    const todayStr = getSofiaDateString(0);
    const maxDateStr = getSofiaDateString(14);
    const [tY, tM] = todayStr.split('-').map(Number);
    const [mY, mM] = maxDateStr.split('-').map(Number);

    if (calPrevMonth) {
      calPrevMonth.disabled = (year < tY || (year === tY && month <= tM - 1));
    }
    if (calNextMonth) {
      calNextMonth.disabled = (year > mY || (year === mY && month >= mM - 1));
    }

    if (calWeekdaysRow && calWeekdaysRow.children.length === 0) {
      const days = calWeekdays[lang] || calWeekdays.en;
      calWeekdaysRow.innerHTML = days.map(d => `<span>${d}</span>`).join('');
    }

    calDaysGrid.innerHTML = '';

    const firstDay = new Date(Date.UTC(year, month, 1));
    const startDay = (firstDay.getUTCDay() + 6) % 7; // Mon=0, Sun=6
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const cells = [];

    // Trailing days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // Leading days of next month
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextDaysNeeded = totalCells - cells.length;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: false });
    }

    cells.forEach(cell => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day-cell';
      btn.textContent = cell.day;
      btn.setAttribute('data-date', cell.dateStr);

      if (!cell.isCurrentMonth) {
        btn.classList.add('other-month');
      }

      if (cell.dateStr === todayStr) {
        btn.classList.add('is-today');
      }

      if (cell.dateStr === currentSelectedDate) {
        btn.classList.add('selected');
        btn.setAttribute('aria-selected', 'true');
      }

      const avail = getDateAvailability(cell.dateStr);
      const isPast = cell.dateStr < todayStr;
      const isBeyondRange = cell.dateStr > maxDateStr;

      if (isPast || isBeyondRange) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      } else if (avail.isWeekend) {
        btn.classList.add('weekend');
        btn.disabled = true;
        btn.title = labels.weekend[lang] || labels.weekend.en;
      } else if (avail.isFull) {
        btn.classList.add('sold-out');
        btn.disabled = true;
        btn.title = labels.soldOut[lang] || labels.soldOut.en;
      } else if (avail.isInsufficient) {
        btn.classList.add('insufficient');
        btn.disabled = true;
        btn.title = labels.insufficientDesks[lang] || labels.insufficientDesks.en;
      } else if (avail.isEligible) {
        btn.classList.add('available');
        btn.title = labels.desksLeft(avail.availableDesks, lang);
        btn.addEventListener('click', () => {
          selectDate(cell.dateStr);
        });
      } else {
        btn.disabled = true;
      }

      calDaysGrid.appendChild(btn);
    });
  }

  function toggleInlineCalendar(forceShow) {
    if (!inlineCalendar) return;
    const isCurrentlyOpen = !inlineCalendar.hidden;
    const shouldOpen = typeof forceShow === 'boolean' ? forceShow : !isCurrentlyOpen;

    if (shouldOpen) {
      inlineCalendar.hidden = false;
      if (pickDateTrigger) {
        pickDateTrigger.classList.add('open');
        pickDateTrigger.setAttribute('aria-expanded', 'true');
      }
      if (currentSelectedDate) {
        const [sY, sM] = currentSelectedDate.split('-').map(Number);
        calViewYear = sY;
        calViewMonth = sM - 1;
      } else if (calViewYear === null || calViewMonth === null) {
        const [tY, tM] = getSofiaDateString(0).split('-').map(Number);
        calViewYear = tY;
        calViewMonth = tM - 1;
      }
      renderCalendar(calViewYear, calViewMonth);
    } else {
      inlineCalendar.hidden = true;
      if (pickDateTrigger) {
        pickDateTrigger.classList.remove('open');
        pickDateTrigger.setAttribute('aria-expanded', 'false');
      }
    }
  }

  function selectDate(dateStr) {
    if (!dateStr) return;

    const avail = getDateAvailability(dateStr);

    if (avail.isWeekend) {
      if (step1Alert) {
        step1Alert.textContent = labels.weekendNotice[lang] || labels.weekendNotice.en;
        step1Alert.hidden = false;
      }
      return;
    }
    if (avail.isFull) {
      if (step1Alert) {
        step1Alert.textContent = errorMessages.no_desks_available[lang] || errorMessages.no_desks_available.en;
        step1Alert.hidden = false;
      }
      return;
    }
    if (avail.isInsufficient) {
      if (step1Alert) {
        step1Alert.textContent = labels.insufficientNotice[lang] || labels.insufficientNotice.en;
        step1Alert.hidden = false;
      }
      return;
    }

    currentSelectedDate = dateStr;

    if (step1Alert) {
      step1Alert.hidden = true;
      step1Alert.textContent = '';
    }

    onSelectionChanged();
  }

  function onSelectionChanged() {
    updateQuickDateCards();
    updateCalendarSelection();

    if (!currentSelectedDate) {
      if (step1ContinueBtn) step1ContinueBtn.disabled = true;
      if (continueBtnText) {
        continueBtnText.textContent = labels.continueSelectDate[lang] || labels.continueSelectDate.en;
      }
    } else {
      if (step1ContinueBtn) step1ContinueBtn.disabled = false;
      if (continueBtnText) {
        const dateFmt = formatDisplayDate(currentSelectedDate, lang);
        continueBtnText.textContent = labels.continueWithDate(dateFmt, lang);
      }
    }
  }

  function renderStep2Summary() {
    if (!currentSelectedDate) return;

    const unitPrice = 10 * neededDesks;
    const totalPrice = unitPrice;

    if (step2PassTag) {
      step2PassTag.textContent = labels.passTag(neededDesks, lang);
    }
    if (step2UnitPrice) {
      step2UnitPrice.textContent = `${unitPrice}€`;
    }

    if (step2DateDisplay) {
      step2DateDisplay.textContent = formatDisplayDate(currentSelectedDate, lang);
    }

    if (totalDisplay) {
      totalDisplay.textContent = `${totalPrice}€`;
    }

    if (metaDisplay) {
      if (neededDesks === 2) {
        metaDisplay.textContent = labels.twoDesksMeta(totalPrice, lang);
      } else {
        metaDisplay.textContent = labels.singleDeskMeta[lang] || labels.singleDeskMeta.en;
      }
    }

    if (submitBtnText) {
      submitBtnText.textContent = labels.confirmBtn(totalPrice, lang);
    }
  }

  function goToStep2() {
    if (!currentSelectedDate) return;

    if (step1View) {
      step1View.hidden = true;
      step1View.classList.remove('active');
    }
    if (step2Form) {
      step2Form.hidden = false;
      step2Form.classList.add('active');
    }
    if (stepBar1) {
      stepBar1.classList.remove('active');
      stepBar1.classList.add('completed');
    }
    if (stepBar2) {
      stepBar2.classList.add('active');
    }

    renderStep2Summary();

    if (nameInput) {
      setTimeout(() => nameInput.focus(), 50);
    }
  }

  function goToStep1() {
    if (step2Form) {
      step2Form.hidden = true;
      step2Form.classList.remove('active');
    }
    if (step1View) {
      step1View.hidden = false;
      step1View.classList.add('active');
    }
    if (stepBar2) {
      stepBar2.classList.remove('active');
    }
    if (stepBar1) {
      stepBar1.classList.remove('completed');
      stepBar1.classList.add('active');
    }
  }

  function openBookingDialog() {
    if (stepTracker) stepTracker.hidden = false;
    if (stepBar1) {
      stepBar1.classList.add('active');
      stepBar1.classList.remove('completed');
    }
    if (stepBar2) {
      stepBar2.classList.remove('active');
    }
    if (step1View) {
      step1View.hidden = false;
      step1View.classList.add('active');
    }
    if (step2Form) {
      step2Form.hidden = true;
      step2Form.classList.remove('active');
    }
    if (successView) successView.hidden = true;
    if (step1Alert) {
      step1Alert.hidden = true;
      step1Alert.textContent = '';
    }
    if (step2Alert) {
      step2Alert.hidden = true;
      step2Alert.textContent = '';
    }
    toggleInlineCalendar(false);

    if (twoDesksCheckbox) {
      twoDesksCheckbox.checked = false;
      neededDesks = 1;
    }

    const todayStr = getSofiaDateString(0);
    const tomorrowStr = getSofiaDateString(1);

    updateQuickDateCards();

    // Auto-select initial date if none selected yet or if current date is no longer eligible
    const curAvail = currentSelectedDate ? getDateAvailability(currentSelectedDate) : null;
    if (!currentSelectedDate || !curAvail || !curAvail.isEligible) {
      const todayAvail = getDateAvailability(todayStr);
      const tomorrowAvail = getDateAvailability(tomorrowStr);

      if (todayAvail.isEligible) {
        currentSelectedDate = todayStr;
      } else if (tomorrowAvail.isEligible) {
        currentSelectedDate = tomorrowStr;
      } else {
        const state = getCachedAvailability();
        if (state && Array.isArray(state.dates)) {
          const firstEligible = state.dates.find(d => d.availableDesks >= neededDesks && d.date >= todayStr);
          if (firstEligible) {
            currentSelectedDate = firstEligible.date;
          }
        }
      }
    }

    onSelectionChanged();

    // Open modal
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeBookingDialog() {
    toggleInlineCalendar(false);
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  // Intercept all booking triggers
  const bookingTriggers = document.querySelectorAll(
    '.book-btn, .availability-book-btn, .open-booking-dialog, .pricing-book-btn, a[href*="ohmydesk.app/book/"]'
  );

  bookingTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingDialog();
    });
  });

  // Quick date events
  if (quickDateToday) {
    quickDateToday.addEventListener('click', () => {
      selectDate(getSofiaDateString(0));
    });
  }

  if (quickDateTomorrow) {
    quickDateTomorrow.addEventListener('click', () => {
      selectDate(getSofiaDateString(1));
    });
  }

  // 2 Desks checkbox event (with live API refresh)
  if (twoDesksCheckbox) {
    twoDesksCheckbox.addEventListener('change', async () => {
      neededDesks = twoDesksCheckbox.checked ? 2 : 1;

      if (twoDesksSpinner) twoDesksSpinner.hidden = false;

      try {
        sessionStorage.removeItem('desk_availability');
        const freshState = await getAvailabilityState();
        if (freshState && freshState.status !== 'unknown') {
          setCachedAvailability(freshState);
        }
      } catch (err) {
        console.warn('Could not refresh live availability:', err);
      } finally {
        if (twoDesksSpinner) twoDesksSpinner.hidden = true;
      }

      if (currentSelectedDate) {
        const avail = getDateAvailability(currentSelectedDate);
        if (!avail.isEligible) {
          if (step1Alert) {
            step1Alert.textContent = labels.insufficientNotice[lang] || labels.insufficientNotice.en;
            step1Alert.hidden = false;
          }
          currentSelectedDate = null;
        }
      }

      updateQuickDateCards();
      if (inlineCalendar && !inlineCalendar.hidden) {
        renderCalendar(calViewYear, calViewMonth);
      }
      onSelectionChanged();
    });
  }

  // Inline calendar toggle & navigation events
  if (pickDateTrigger) {
    pickDateTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleInlineCalendar();
    });
  }

  if (calPrevMonth) {
    calPrevMonth.addEventListener('click', (e) => {
      e.preventDefault();
      if (calViewMonth === 0) {
        calViewMonth = 11;
        calViewYear -= 1;
      } else {
        calViewMonth -= 1;
      }
      renderCalendar(calViewYear, calViewMonth);
    });
  }

  if (calNextMonth) {
    calNextMonth.addEventListener('click', (e) => {
      e.preventDefault();
      if (calViewMonth === 11) {
        calViewMonth = 0;
        calViewYear += 1;
      } else {
        calViewMonth += 1;
      }
      renderCalendar(calViewYear, calViewMonth);
    });
  }

  if (calDoneBtn) {
    calDoneBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleInlineCalendar(false);
    });
  }

  if (step1ContinueBtn) {
    step1ContinueBtn.addEventListener('click', goToStep2);
  }

  if (backBtn) {
    backBtn.addEventListener('click', goToStep1);
  }

  // Form submit -> Native OhMyDesk API POST
  if (step2Form) {
    step2Form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (step2Alert) {
        step2Alert.hidden = true;
        step2Alert.textContent = '';
      }

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const notesVal = notesInput ? notesInput.value.trim() : '';

      const unitPrice = 10 * neededDesks;
      const totalPrice = unitPrice;
      const deskCountText = neededDesks === 2 ? '2 desks' : '1 desk';
      const planName = `Daily Pass (${deskCountText})`;

      if (!nameVal) {
        if (step2Alert) {
          step2Alert.textContent = errorMessages.missing_visitor_name[lang] || errorMessages.missing_visitor_name.en;
          step2Alert.hidden = false;
        }
        if (nameInput) nameInput.focus();
        return;
      }

      if (!currentSelectedDate) {
        goToStep1();
        if (step1Alert) {
          step1Alert.textContent = errorMessages.date_out_of_range[lang] || errorMessages.date_out_of_range.en;
          step1Alert.hidden = false;
        }
        return;
      }

      // Enter loading state
      if (submitBtn) submitBtn.disabled = true;
      if (submitSpinner) submitSpinner.hidden = false;

      const idempotencyKey = `codeburg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        dates: [currentSelectedDate],
        visitorName: nameVal,
        visitorEmail: emailVal || undefined,
        visitorPhone: phoneVal || undefined,
        notes: `Plan: ${planName} (${totalPrice}€). ${notesVal}`.trim()
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
          const deskLabels = result.data.bookings.map(b => b.deskLabel).filter(Boolean).join(', ') || 'Assigned';

          // Populate success card
          if (successDeskLabel) successDeskLabel.textContent = deskLabels;
          if (successDateVal) {
            successDateVal.textContent = formatDisplayDate(currentSelectedDate, lang);
          }
          if (successPlanVal) successPlanVal.textContent = `${planName} (${totalPrice}€)`;

          // Transition to success screen
          step2Form.hidden = true;
          if (stepTracker) stepTracker.hidden = true;
          if (successView) successView.hidden = false;

          // Clear availability cache to reflect newly booked slot & update hero
          sessionStorage.removeItem('desk_availability');
          if (typeof initAvailability === 'function') {
            initAvailability();
          }
        } else {
          // Display structured API error
          const errCode = (result.error && result.error.code) || '';
          const errMsg = (result.error && result.error.message) || '';
          const localizedErr = (errorMessages[errCode] && errorMessages[errCode][lang]) ||
            errMsg ||
            errorMessages.generic[lang] ||
            errorMessages.generic.en;

          if (step2Alert) {
            step2Alert.textContent = localizedErr;
            step2Alert.hidden = false;
          }
        }
      } catch (err) {
        console.error('Booking submission error:', err);
        if (step2Alert) {
          step2Alert.textContent = errorMessages.generic[lang] || errorMessages.generic.en;
          step2Alert.hidden = false;
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
  initPerformanceOptimizations();
  initDeskWidget();
  initStayCalculator();
  initGalleryLightbox();
  initFaq();
  initCopyAddress();
  initAudioAmbience();
  initAvailability();
  initAvailabilityButton();
  initBookingDialog();
});
