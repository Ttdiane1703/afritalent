document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const backToTop = document.getElementById("backToTop");
  const revealItems = document.querySelectorAll("main section, footer");
  const counters = document.querySelectorAll(".carte-stat strong");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    body.classList.toggle("theme-dark", isDark);

    if (themeToggle) {
      themeToggle.classList.toggle("btn-outline-dark", !isDark);
      themeToggle.classList.toggle("btn-outline-light", isDark);
      themeToggle.setAttribute("aria-label", isDark ? "Activer le mode clair" : "Activer le mode sombre");
      themeToggle.setAttribute("title", isDark ? "Mode clair" : "Mode sombre");
    }

    if (themeIcon) {
      themeIcon.classList.toggle("bi-moon", !isDark);
      themeIcon.classList.toggle("bi-sun", isDark);
    }

    localStorage.setItem("theme", theme);
  }

  function updateScrollEffects() {
    const hasScrolled = window.scrollY > 80;

    if (navbar) {
      navbar.classList.toggle("navbar-scrolled", hasScrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 350);
    }
  }

  function parseCounterValue(text) {
    const normalized = text.trim().toLowerCase().replace(/\s/g, "");
    const hasPlus = normalized.includes("+");
    const usesK = normalized.includes("k");
    const numericValue = parseFloat(normalized.replace(",", ".").replace(/[^\d.]/g, ""));
    const multiplier = usesK ? 1000 : 1;

    return {
      target: Number.isNaN(numericValue) ? 0 : numericValue * multiplier,
      hasPlus,
      usesK
    };
  }

  function formatCounterValue(value, options) {
    if (options.usesK) {
      return `${Math.round(value / 1000)}k${options.hasPlus ? "+" : ""}`;
    }

    return `${Math.round(value).toLocaleString("fr-FR")}${options.hasPlus ? "+" : ""}`;
  }

  function animateCounter(counter) {
    if (counter.dataset.animated === "true") {
      return;
    }

    const options = parseCounterValue(counter.dataset.counterValue || counter.textContent);
    const duration = 1400;
    const startTime = performance.now();
    counter.dataset.animated = "true";

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      counter.textContent = formatCounterValue(options.target * easedProgress, options);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  updateScrollEffects();

  revealItems.forEach((item) => {
    item.setAttribute("data-reveal", "");
  });

  counters.forEach((counter) => {
    counter.dataset.counterValue = counter.textContent.trim();
    counter.textContent = "0";
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14
    });

    revealItems.forEach((item) => revealObserver.observe(item));

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counters.forEach((counter) => animateCounter(counter));
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  window.addEventListener("scroll", updateScrollEffects);
});
