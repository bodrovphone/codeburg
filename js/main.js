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
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  for (let i = 0; i < 10; i++) {
    const currentDate = new Date(tomorrow);
    currentDate.setDate(tomorrow.getDate() + i);
    const dateString = formatDate(currentDate);
    
    if (!isWeekend(dateString)) {
      dates.push(dateString);
    }
  }
  
  return dates;
}

async function fetchBookings() {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}?select=desk_id,date,status`, {
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
  
  button.addEventListener('click', async function() {
    const texts = getLocalizedTexts();
    
    resultDiv.className = 'availability-result loading';
    resultDiv.textContent = texts.loading;
    
    try {
      const bookings = await fetchBookings();
      const availableDates = await getNextAvailableDates();
      
      console.log('Raw bookings data:', bookings);
      console.log('Bookings array length:', bookings.length);
      console.log('DESKS array:', DESKS);
      console.log('Available dates calculated:', availableDates);
      
      // Test calculation for first date
      if (availableDates.length > 0) {
        const testDate = availableDates[0].date;
        const testCount = calculateAvailableDesks(bookings, testDate);
        console.log(`Test calculation for ${testDate}: ${testCount} available desks`);
      }
      
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
      error: 'Ошибка при проверке наличия. Попробуйте позже.'
    };
  } else if (currentPath.includes('/ua/')) {
    return {
      title: 'Наступна доступна дата',
      desks: 'столів',
      noAvailability: 'Немає доступних столів у найближчі 10 днів. Будь ласка, зв\'яжіться з нами безпосередньо для уточнення наявності.',
      loading: 'Перевіряємо наявність...',
      error: 'Помилка при перевірці наявності. Спробуйте пізніше.'
    };
  } else if (currentPath.includes('/bg/')) {
    return {
      title: 'Следваща налична дата',
      desks: 'бюра',
      noAvailability: 'Няма налични бюра в следващите 10 дни. Моля, свържете се с нас директно за наличност.',
      loading: 'Проверяваме наличността...',
      error: 'Грешка при проверка на наличността. Опитайте отново по-късно.'
    };
  } else {
    return {
      title: 'Next Available Date',
      desks: 'desks',
      noAvailability: 'No desks available in the next 10 days. Please contact us directly for availability.',
      loading: 'Checking availability...',
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

document.addEventListener('DOMContentLoaded', initAvailabilityButton);
