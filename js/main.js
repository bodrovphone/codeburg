document.querySelector('.language-button').addEventListener('click', function() {
  // Only handle dropdown on mobile screens
  if (window.innerWidth <= 600) {
    const dropdown = document.querySelector('.language-dropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  }
});

// Close dropdown when clicking outside (only on mobile)
document.addEventListener('click', function(event) {
  if (window.innerWidth <= 600 && !event.target.closest('.language-switcher')) {
    document.querySelector('.language-dropdown').style.display = 'none';
  }
});

// Reset display style when screen size changes
window.addEventListener('resize', function() {
  const dropdown = document.querySelector('.language-dropdown');
  if (window.innerWidth > 600) {
    dropdown.style.display = 'flex';
  } else {
    dropdown.style.display = 'none';
  }
});

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