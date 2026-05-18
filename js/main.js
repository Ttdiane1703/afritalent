document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const backToTop = document.getElementById("backToTop");

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

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  updateScrollEffects();

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
