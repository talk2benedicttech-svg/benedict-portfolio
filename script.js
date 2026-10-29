const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const mobileMenu = window.matchMedia('(max-width: 650px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = [...document.querySelectorAll('.reveal')];
const countValues = [...document.querySelectorAll('[data-count]')];

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
  if (!event.matches) return;

  document.documentElement.classList.remove('motion-ready');
  revealObserver?.disconnect();
  countObserver?.disconnect();
  revealItems.forEach((item) => item.classList.add('is-visible'));
  countValues.forEach((item) => { item.textContent = item.dataset.count; });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

