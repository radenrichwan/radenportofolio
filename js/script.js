// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-link");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");

    navLinks.classList.toggle("open", !isOpen);
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

// ==========================================
// REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(".reveal");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

// ==========================================
// PROJECT CATEGORY FILTERS
// ==========================================

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const shouldShow = selectedFilter === "all" || categories.includes(selectedFilter);

      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

// ==========================================
// HEADER BORDER & SCROLL PROGRESS
// ==========================================

const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress");

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

// ==========================================
// SECTION NAVIGATION (SCROLL-SPY & INDICATOR)
// ==========================================

const sections = Array.from(document.querySelectorAll("main section[id]"));

const navSectionLinks = document.querySelectorAll(".nav-link");

let currentSectionIndex = 0;
let isProgrammaticScroll = false;
let scrollTimeoutId = null;

const totalSectionsFormatted = String(sections.length || 7).padStart(2, "0");

// Create floating page navigation capsule (Fixed at bottom right)
const pageNavigation = document.createElement("div");
pageNavigation.className = "page-navigation";
pageNavigation.setAttribute("aria-label", "Section navigation");

pageNavigation.innerHTML = `
  <button
    class="page-nav-button page-nav-prev"
    type="button"
    aria-label="Previous section"
    title="Previous section"
  >
    ←
  </button>

  <span class="page-nav-counter">01 / ${totalSectionsFormatted}</span>

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

const previousButton = pageNavigation.querySelector(".page-nav-prev");
const nextButton = pageNavigation.querySelector(".page-nav-next");
const pageCounter = pageNavigation.querySelector(".page-nav-counter");

// Update floating capsule counter and active navbar link
function updateSectionNavigation(index) {
  if (!sections.length) return;

  currentSectionIndex = Math.max(0, Math.min(index, sections.length - 1));

  const currentSection = sections[currentSectionIndex];
  const currentNumber = String(currentSectionIndex + 1).padStart(2, "0");
  const totalNumber = String(sections.length).padStart(2, "0");

  // Dynamically update the floating capsule counter
  pageCounter.textContent = `${currentNumber} / ${totalNumber}`;

  previousButton.disabled = currentSectionIndex === 0;
  nextButton.disabled = currentSectionIndex === sections.length - 1;

  navSectionLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection.id}`);
  });
}

// Smooth scroll to a specific section with fixed header offset
function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;

  isProgrammaticScroll = true;
  clearTimeout(scrollTimeoutId);

  const targetSection = sections[index];
  const headerOffset = 76;
  const targetTop = targetSection.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = Math.max(0, targetTop - (index === 0 ? 0 : headerOffset));

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  updateSectionNavigation(index);

  scrollTimeoutId = setTimeout(() => {
    isProgrammaticScroll = false;
    detectActiveSection();
  }, 800);
}

// Previous section button
previousButton.addEventListener("click", () => {
  if (currentSectionIndex > 0) {
    scrollToSection(currentSectionIndex - 1);
  }
});

// Next section button
nextButton.addEventListener("click", () => {
  if (currentSectionIndex < sections.length - 1) {
    scrollToSection(currentSectionIndex + 1);
  }
});

// Detect section currently visible based on scroll position (Scroll-Spy)
function detectActiveSection() {
  if (!sections.length || isProgrammaticScroll) return;

  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 1. Bottom of page -> always highlight last section (07 - Contact)
  if (scrollY + viewportHeight >= documentHeight - 50) {
    updateSectionNavigation(sections.length - 1);
    return;
  }

  // 2. Top of page -> always highlight first section (01 - Home)
  if (scrollY < 80) {
    updateSectionNavigation(0);
    return;
  }

  // 3. Middle sections -> trigger based on marker position
  const triggerPoint = scrollY + Math.min(260, viewportHeight * 0.35);

  let activeIndex = 0;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionTop = section.getBoundingClientRect().top + scrollY;

    if (triggerPoint >= sectionTop) {
      activeIndex = i;
    } else {
      break;
    }
  }

  updateSectionNavigation(activeIndex);
}

// Listen to scroll with requestAnimationFrame throttle
let scrollTicking = false;

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        detectActiveSection();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  },
  { passive: true },
);

window.addEventListener("resize", detectActiveSection, { passive: true });

// Initial navigation state
updateSectionNavigation(0);
detectActiveSection();

// ==========================================
// BACK TO TOP
// ==========================================

const backToTop = document.getElementById("back-to-top");

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ==========================================
// DYNAMIC FOOTER YEAR
// ==========================================

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
