/**
 * Jan Industries - Interactive Vanilla JavaScript
 * High-performance, zero dependencies, accessible.
 */

document.addEventListener("DOMContentLoaded", () => {
  initScrollEffects();
  initMobileMenu();
  initProductCatalog();
  initHeroHotspots();
  initStatsCounter();
  initFaqAccordion();
  initScrollReveal();
});

/**
 * 1. Scroll Effects: Sticky Header shadow & Scroll-To-Top button
 */
function initScrollEffects() {
  const header = document.querySelector(".main-header");
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    // Header shadow
    if (header) {
      if (y > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    // Scroll to top visibility
    if (scrollTopBtn) {
      if (y > 400) {
        scrollTopBtn.classList.add("is-visible");
      } else {
        scrollTopBtn.classList.remove("is-visible");
      }
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }
}

/**
 * 2. Mobile Navigation Drawer
 */
function initMobileMenu() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileNavDrawer");
  if (!menuBtn || !drawer) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains("is-open");
    if (isOpen) {
      drawer.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span class="sr-only">Close menu</span>
      `;
    } else {
      drawer.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
        <span class="sr-only">Open menu</span>
      `;
    }
  }

  menuBtn.addEventListener("click", () => toggleMenu());

  // Close on navigation link click
  drawer.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("click", () => toggleMenu(false));
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });

  // Close on click outside
  document.addEventListener("click", (e) => {
    if (drawer.classList.contains("is-open") && !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/**
 * 3. Product Catalog Category Filtering & Tabs
 */
function initProductCatalog() {
  const tabs = document.querySelectorAll(".category-tab");
  const cards = document.querySelectorAll(".product-card");
  if (!tabs.length || !cards.length) return;

  function setCategory(categoryId) {
    tabs.forEach(tab => {
      const match = tab.getAttribute("data-category") === categoryId;
      tab.classList.toggle("is-active", match);
      tab.setAttribute("aria-selected", match ? "true" : "false");
      tab.tabIndex = match ? 0 : -1;
    });

    cards.forEach(card => {
      const cardCategory = card.getAttribute("data-category");
      if (categoryId === "all" || cardCategory === categoryId) {
        card.style.display = "";
        card.style.opacity = "0";
        card.style.transform = "translateY(12px)";
        requestAnimationFrame(() => {
          card.style.transition = "opacity 300ms ease, transform 300ms ease";
          card.style.opacity = "1";
          card.style.transform = "none";
        });
      } else {
        card.style.display = "none";
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      const categoryId = tab.getAttribute("data-category");
      setCategory(categoryId);
    });

    // Keyboard navigation (Arrow keys)
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const nextIdx = (index + dir + tabs.length) % tabs.length;
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      }
    });
  });

  // Expose globally for Hotspots
  window.janSetCategory = setCategory;
}

/**
 * 4. Interactive Hero Hotspots
 */
function initHeroHotspots() {
  const triggerHotspot = (categoryId, productId) => {
    if (typeof window.janSetCategory === "function") {
      window.janSetCategory(categoryId);
    }

    const targetCard = document.getElementById(`product-${productId}`);
    if (targetCard) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      targetCard.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center"
      });

      // Highlight pulse
      targetCard.classList.remove("is-highlighted");
      void targetCard.offsetWidth; // Force reflow
      targetCard.classList.add("is-highlighted");

      setTimeout(() => {
        targetCard.classList.remove("is-highlighted");
      }, 3500);
    }
  };

  // Hotspot buttons in hero image overlay
  document.querySelectorAll("[data-hotspot-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-hotspot-category");
      const product = btn.getAttribute("data-hotspot-product");
      triggerHotspot(category, product);
    });
  });

  // Nav buttons that jump to category
  document.querySelectorAll("[data-nav-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-nav-category");
      const section = document.getElementById("products");
      if (typeof window.janSetCategory === "function") {
        window.janSetCategory(category);
      }
      if (section) {
        section.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      }
    });
  });
}

/**
 * 5. Animated Stats Counter (CountUp with IntersectionObserver)
 */
function initStatsCounter() {
  const statsSection = document.querySelector(".stats-section");
  if (!statsSection) return;

  const countElements = document.querySelectorAll("[data-count-to]");
  let started = false;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const runCountUp = () => {
    if (started) return;
    started = true;

    countElements.forEach(el => {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";

      if (prefersReduced) {
        el.textContent = (decimals > 0 ? target.toFixed(decimals) : Math.round(target)) + suffix;
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * eased;

        el.textContent = (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal)) + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = (decimals > 0 ? target.toFixed(decimals) : Math.round(target)) + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runCountUp();
      observer.disconnect();
    }
  }, { threshold: 0.25 });

  observer.observe(statsSection);
}

/**
 * 6. FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    const panel = item.querySelector(".faq-answer-panel");
    const inner = item.querySelector(".faq-answer-inner");
    if (!btn || !panel || !inner) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Optional: Close others (accordion style) or allow multiple
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains("is-open")) {
          other.classList.remove("is-open");
          other.querySelector(".faq-question-btn")?.setAttribute("aria-expanded", "false");
          const otherPanel = other.querySelector(".faq-answer-panel");
          if (otherPanel) otherPanel.style.maxHeight = "0";
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = "0";
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = inner.scrollHeight + 20 + "px";
      }
    });
  });
}

/**
 * 7. Scroll Reveal Animations
 */
function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-in"));
    return;
  }

  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach(el => observer.observe(el));
}
