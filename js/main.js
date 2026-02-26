(() => {
  // === Theme toggle ===
  const THEME_KEY = 'kalenex-theme';
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(getPreferredTheme());

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Respect OS changes while tab is open
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  // Dev/prod app link base (hash routing)
  const APP_BASE = location.hostname === 'localhost' ? 'http://localhost:3000/#' : '/app/#';

  // Rewrite data-app-link hrefs
  document.querySelectorAll('[data-app-link]').forEach(el => {
    const route = el.getAttribute('data-app-link');
    el.href = `${APP_BASE}/${route}`;
  });

  // Header shadow on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  }, { passive: true });

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('.header__nav');
  const actions = document.querySelector('.header__actions');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    actions.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
  });

  // Close menu on nav link click
  document.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      actions.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Intersection Observer — fade-in cards
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();
