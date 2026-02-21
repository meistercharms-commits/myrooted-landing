/* ═══════════════════════════════════════════════════════════════════════════ */
/* ROOTED LANDING PAGE — JAVASCRIPT */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════ */
/* NAVIGATION & HAMBURGER MENU */
/* ═══════════════════════════════════════════════════════════════════════════ */

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const nav = document.getElementById('nav');

// Toggle hamburger menu
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}

// Close menu when clicking a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SCROLL PROGRESS BAR */
/* ═══════════════════════════════════════════════════════════════════════════ */

const navProgress = document.querySelector('.nav-progress');

window.addEventListener('scroll', () => {
  // Add 'scrolled' class to nav for background change
  nav.classList.toggle('scrolled', window.scrollY > 40);

  // Update progress bar
  const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  navProgress.style.width = scrolled + '%';
}, { passive: true });

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SMOOTH SCROLL FOR INTERNAL LINKS */
/* ═══════════════════════════════════════════════════════════════════════════ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return; // Skip logo links

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed nav
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SCROLL REVEAL ANIMATIONS */
/* ═══════════════════════════════════════════════════════════════════════════ */

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════════════════════ */
/* FORM VALIDATION */
/* ═══════════════════════════════════════════════════════════════════════════ */

const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const formSuccess = document.getElementById('form-success');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return emailRegex.test(email);
}

function showError(input, message) {
  const formGroup = input.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');

  formGroup.classList.add('error');
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearError(input) {
  const formGroup = input.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');

  formGroup.classList.remove('error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

// Real-time validation
emailInput.addEventListener('blur', () => {
  const value = emailInput.value.trim();
  if (value === '') {
    showError(emailInput, 'Email address is required');
  } else if (!validateEmail(value)) {
    showError(emailInput, 'Please enter a valid email address');
  } else {
    clearError(emailInput);
  }
});

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Clear previous errors
  document.querySelectorAll('.form-group').forEach(g => clearError(g.querySelector('.form-input')));

  // Validate email
  const email = emailInput.value.trim();
  let isValid = true;

  if (email === '') {
    showError(emailInput, 'Email address is required');
    isValid = false;
  } else if (!validateEmail(email)) {
    showError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }

  if (!isValid) {
    emailInput.focus();
    return;
  }

  // Show success message
  showSuccessMessage();

  // Submit to Formspree
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: {
      'Accept': 'application/json'
    }
  }).catch(error => console.error('Form submission error:', error));
});

function showSuccessMessage() {
  // Hide form
  form.classList.add('submitted');

  // Show success message with animation
  formSuccess.classList.add('visible');
  formSuccess.setAttribute('aria-hidden', 'false');

  // Reset form for next potential submission
  form.reset();

  // Optional: Reset form after delay to allow users to see message
  setTimeout(() => {
    form.classList.remove('submitted');
    formSuccess.classList.remove('visible');
    formSuccess.setAttribute('aria-hidden', 'true');
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* FAQ ACCORDION */
/* ═══════════════════════════════════════════════════════════════════════════ */

const faqItems = document.querySelectorAll('.faq-item');
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', (e) => {
    e.preventDefault();

    const faqItem = question.closest('.faq-item');
    const isOpen = faqItem.classList.contains('open');

    // Close all other items
    faqItems.forEach(item => {
      if (item !== faqItem && item.classList.contains('open')) {
        item.classList.remove('open');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current item
    if (isOpen) {
      faqItem.classList.remove('open');
      question.setAttribute('aria-expanded', 'false');
    } else {
      faqItem.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });

  // Keyboard navigation (Enter/Space to open)
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      question.click();
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════ */
/* UTILITY: FOCUS TRAP (Optional, for accessibility) */
/* ═══════════════════════════════════════════════════════════════════════════ */

// Ensure keyboard navigation works through all interactive elements
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu on Escape
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

/* ═══════════════════════════════════════════════════════════════════════════ */
/* PREFERS REDUCED MOTION CHECK */
/* ═══════════════════════════════════════════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Remove animation classes or reduce animation durations
  revealElements.forEach(el => {
    el.style.animation = 'none';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* END OF JAVASCRIPT */
/* ═══════════════════════════════════════════════════════════════════════════ */
