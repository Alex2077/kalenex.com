/**
 * Kalenex i18n module.
 *
 * Language resolution order:
 *   1. ?lang=xx query param
 *   2. localStorage('kalenex-lang')
 *   3. navigator.language / navigator.languages
 *   4. fallback → 'en'
 *
 * To add a new language:
 *   1. Create  i18n/{code}.json  with the same keys as en.json
 *   2. Add an entry to LANGUAGES below
 *   That's it — the switcher and routing update automatically.
 */
const I18n = (() => {
  // ── Supported languages (add new ones here) ──────────────────────
  const LANGUAGES = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'es', label: 'Español', flag: 'ES' },
    // { code: 'fr', label: 'Français', flag: 'FR' },
  ];

  const STORAGE_KEY = 'kalenex-lang';
  const DEFAULT_LANG = 'en';
  let currentLang = DEFAULT_LANG;
  let translations = {};

  // ── Detect language ──────────────────────────────────────────────
  function detectLanguage() {
    // 1. URL param
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang && isSupported(paramLang)) return paramLang;

    // 2. localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;

    // 3. Browser language
    const browserLangs = navigator.languages || [navigator.language];
    for (const bl of browserLangs) {
      const short = bl.split('-')[0].toLowerCase();
      if (isSupported(short)) return short;
    }

    return DEFAULT_LANG;
  }

  function isSupported(code) {
    return LANGUAGES.some(l => l.code === code);
  }

  // ── Load & apply ─────────────────────────────────────────────────
  async function load(lang) {
    try {
      const res = await fetch(`i18n/${lang}.json`);
      if (!res.ok) throw new Error(res.status);
      translations = await res.json();
    } catch {
      if (lang !== DEFAULT_LANG) return load(DEFAULT_LANG);
      translations = {};
    }
  }

  function apply() {
    // data-i18n="key"  →  textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key] != null) el.textContent = translations[key];
    });

    // data-i18n-html="key"  →  innerHTML (for <strong> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (translations[key] != null) el.innerHTML = translations[key];
    });

    // data-i18n-attr="attr:key"  →  element attribute
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach(pair => {
        const [attr, key] = pair.split(':');
        if (translations[key] != null) el.setAttribute(attr.trim(), translations[key]);
      });
    });

    // Update <html lang>
    document.documentElement.lang = currentLang;
  }

  // ── Language switcher ────────────────────────────────────────────
  function buildSwitcher() {
    const menu = document.getElementById('langMenu');
    const currentLabel = document.getElementById('langCurrent');
    if (!menu || !currentLabel) return;

    const active = LANGUAGES.find(l => l.code === currentLang);
    currentLabel.textContent = active ? active.flag : currentLang.toUpperCase();

    menu.innerHTML = '';
    LANGUAGES.forEach(lang => {
      const li = document.createElement('li');
      li.className = 'lang-switcher__item' + (lang.code === currentLang ? ' lang-switcher__item--active' : '');
      li.textContent = lang.label;
      li.setAttribute('data-lang', lang.code);
      li.addEventListener('click', () => switchTo(lang.code));
      menu.appendChild(li);
    });
  }

  async function switchTo(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update URL without reload
    const url = new URL(window.location);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url);

    await load(lang);
    apply();
    buildSwitcher();
  }

  // ── Init ─────────────────────────────────────────────────────────
  async function init() {
    currentLang = detectLanguage();
    await load(currentLang);
    apply();
    buildSwitcher();

    // Toggle dropdown
    const btn = document.getElementById('langBtn');
    const switcher = document.getElementById('langSwitcher');
    if (btn && switcher) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('open');
      });
      document.addEventListener('click', () => switcher.classList.remove('open'));
    }
  }

  return { init, switchTo, getLanguages: () => LANGUAGES, getCurrent: () => currentLang };
})();

document.addEventListener('DOMContentLoaded', () => I18n.init());
