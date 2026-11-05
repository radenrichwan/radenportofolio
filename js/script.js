// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-link');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Open navigation' : 'Close navigation'
    );

    navLinks.classList.toggle('open', !isOpen);
  });

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}


// ==========================================
// REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll('.reveal');

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => {
    element.classList.add('visible');
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}


// ==========================================
// PROJECT CATEGORY FILTERS
// ==========================================

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ');
      const shouldShow =
        selectedFilter === 'all' ||
        categories.includes(selectedFilter);

      card.classList.toggle('is-hidden', !shouldShow);
    });
  });
});


// ==========================================
// HEADER BORDER & SCROLL PROGRESS
// ==========================================

const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress');

function updateScrollUI() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    scrollableHeight > 0
      ? (window.scrollY / scrollableHeight) * 100
      : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();


// ==========================================
// SECTION NAVIGATION
// ==========================================

const sections = Array.from(
  document.querySelectorAll('main section[id]')
);

const navSectionLinks = document.querySelectorAll('.nav-link');

const visualIndex =
  document.querySelector('#visual-index') ||
  document.querySelector('.visual-index');

let currentSectionIndex = 0;


// Create floating page navigation
const pageNavigation = document.createElement('div');

pageNavigation.className = 'page-navigation';

pageNavigation.innerHTML = `
  <button
    class="page-nav-button page-nav-prev"
    type="button"
    aria-label="Previous section"
    title="Previous section"
  >
    ←
  </button>

  <span class="page-nav-counter">01 / 01</span>

  <button
    class="page-nav-button page-nav-next"
    type="button"
    aria-label="Next section"
    title="Next section"
  >
    →
  </button>
`;

document.body.appendChild(pageNavigation);

const previousButton = pageNavigation.querySelector('.page-nav-prev');
const nextButton = pageNavigation.querySelector('.page-nav-next');
const pageCounter = pageNavigation.querySelector('.page-nav-counter');


// Update active section and navigation state
function updateSectionNavigation(index) {
  if (!sections.length) return;

  currentSectionIndex = Math.max(
    0,
    Math.min(index, sections.length - 1)
  );

  const currentSection = sections[currentSectionIndex];

  const currentNumber = String(currentSectionIndex + 1).padStart(2, '0');
  const totalNumber = String(sections.length).padStart(2, '0');

  pageCounter.textContent = `${currentNumber} / ${totalNumber}`;

  previousButton.disabled = currentSectionIndex === 0;
  nextButton.disabled = currentSectionIndex === sections.length - 1;

  navSectionLinks.forEach((link) => {
    link.classList.toggle(
      'active',
      link.getAttribute('href') === `#${currentSection.id}`
    );
  });

  if (visualIndex) {
    visualIndex.textContent = `${currentNumber} / ${totalNumber}`;
  }
}


// Previous section
previousButton.addEventListener('click', () => {
  if (currentSectionIndex > 0) {
    sections[currentSectionIndex - 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
});


// Next section
nextButton.addEventListener('click', () => {
  if (currentSectionIndex < sections.length - 1) {
    sections[currentSectionIndex + 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
});


// Detect section currently visible
if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length) {
        const activeSection = visibleEntries[0].target;
        const activeIndex = sections.indexOf(activeSection);

        if (activeIndex !== -1) {
          updateSectionNavigation(activeIndex);
        }
      }
    },
    {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75]
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}


// Initial navigation state
updateSectionNavigation(0);


// ==========================================
// BACK TO TOP
// ==========================================

const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}


// ==========================================
// DYNAMIC FOOTER YEAR
// ==========================================

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}