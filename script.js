const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const mobileMenu = window.matchMedia('(max-width: 650px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeToggle = document.querySelector('.theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const revealItems = [...document.querySelectorAll('.reveal')];
const countValues = [...document.querySelectorAll('[data-count]')];

function setTheme(theme, save = false) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isLight));
  themeToggle?.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  themeToggle?.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  const icon = themeToggle?.querySelector('span');
  if (icon) icon.textContent = isLight ? '◐' : '☼';
  themeColorMeta?.setAttribute('content', isLight ? '#f7f7f5' : '#09090b');

  if (save) {
    try {
      localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
    } catch {
      // Theme switching still works for this visit if storage is unavailable.
    }
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('portfolio-theme');
} catch {
  // Keep the default dark appearance if storage is unavailable.
}
setTheme(savedTheme === 'light' ? 'light' : 'dark');
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(nextTheme, true);
});

const roleText = document.querySelector('#typed-role');
const roles = ['Software Developer', 'Digital Skills Trainer', 'Data Collection Specialist'];
let roleIndex = 0;
let characterIndex = roleText?.textContent.length || 0;
let deleting = false;
let typingTimer;

function typeNextCharacter() {
  if (!roleText || reducedMotion.matches) return;

  const currentRole = roles[roleIndex];
  characterIndex += deleting ? -1 : 1;
  roleText.textContent = currentRole.slice(0, characterIndex);

  let pause = deleting ? 48 : 92;
  if (!deleting && characterIndex === currentRole.length) pause = 1250;
  if (deleting && characterIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    pause = 300;
  } else if (!deleting && characterIndex === currentRole.length) {
    deleting = true;
  }

  typingTimer = window.setTimeout(typeNextCharacter, pause);
}

if (roleText && !reducedMotion.matches) typingTimer = window.setTimeout(typeNextCharacter, 700);

function setMenuOpen(open, { returnFocus = false } = {}) {
  if (!menuToggle || !siteNav) return;

  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('is-open', open);

  if (returnFocus) menuToggle.focus();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('click', (event) => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen && !siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false, { returnFocus: true });
    }
  });

  mobileMenu.addEventListener?.('change', (event) => {
    if (!event.matches) setMenuOpen(false);
  });
}

// Stagger cards and timeline rows as they enter the viewport.
document.querySelectorAll('.project-grid, .capability-list, .timeline').forEach((group) => {
  [...group.children]
    .filter((item) => item.classList.contains('reveal'))
    .forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 85, 340)}ms`;
    });
});

let revealObserver;
let countObserver;
const canAnimate = !reducedMotion.matches && 'IntersectionObserver' in window;

if (canAnimate) {
  document.documentElement.classList.add('motion-ready');

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer.unobserve(target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));

  countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      animateCount(target);
    });
  }, { threshold: 0.7 });

  countValues.forEach((item) => countObserver.observe(item));
}

function animateCount(node) {
  const endValue = Number(node.dataset.count);
  if (!Number.isFinite(endValue)) return;

  const duration = 900;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    node.textContent = String(Math.round(endValue * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// Keep the desktop navigation in sync with the section currently in view.
const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const linkedSections = sectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section);

if ('IntersectionObserver' in window && linkedSections.length) {
  const activeSectionObserver = new IntersectionObserver((entries) => {
    const activeEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!activeEntry) return;

    linkedSections.forEach(({ link, section }) => {
      if (section === activeEntry.target) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4] });

  linkedSections.forEach(({ section }) => activeSectionObserver.observe(section));
}

reducedMotion.addEventListener?.('change', (event) => {
  if (event.matches) {
    document.documentElement.classList.remove('motion-ready');
    revealObserver?.disconnect();
    countObserver?.disconnect();
    revealItems.forEach((item) => item.classList.add('is-visible'));
    countValues.forEach((item) => { item.textContent = item.dataset.count; });
    window.clearTimeout(typingTimer);
    if (roleText) roleText.textContent = roles[roleIndex];
    return;
  }

  if (roleText) {
    characterIndex = roles[roleIndex].length;
    deleting = true;
    typingTimer = window.setTimeout(typeNextCharacter, 700);
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

