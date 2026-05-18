document.addEventListener("DOMContentLoaded", () => {
  // Elements globaux reutilises par les interactions communes du site.
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
  const backToTop = document.getElementById("backToTop");
  const revealItems = document.querySelectorAll("main section, footer");
  const counters = document.querySelectorAll(".carte-stat strong");
  const filterButtons = document.querySelectorAll(".filter-section [data-filter]");
  const freelanceCards = document.querySelectorAll(".freelance-listing .col-12");
  const contactForm = document.querySelector(".contact-form");

  // Applique le theme choisi et synchronise l'icone du bouton dark/light mode.
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

  // Met a jour les effets lies au scroll : navbar compacte et bouton retour en haut.
  function updateScrollEffects() {
    const hasScrolled = window.scrollY > 80;

    if (navbar) {
      navbar.classList.toggle("navbar-scrolled", hasScrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 350);
    }
  }

  // Convertit le texte d'un compteur ("2 500+", "10k") en valeur numerique animable.
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

  // Reformate la valeur animee pour conserver le format d'origine du compteur.
  function formatCounterValue(value, options) {
    if (options.usesK) {
      return `${Math.round(value / 1000)}k${options.hasPlus ? "+" : ""}`;
    }

    return `${Math.round(value).toLocaleString("fr-FR")}${options.hasPlus ? "+" : ""}`;
  }

  // Anime un compteur une seule fois lorsqu'il entre dans le viewport.
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

  // Filtre les cartes freelances par categorie sans recharger la page.
  function initFreelanceFilters() {
    if (!filterButtons.length || !freelanceCards.length) {
      return;
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCategory = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        freelanceCards.forEach((column) => {
          const card = column.querySelector(".carte-freelance");
          const cardCategory = card ? card.dataset.category : "";
          const isVisible = selectedCategory === "all" || cardCategory === selectedCategory;
          column.classList.toggle("is-filtered-out", !isVisible);
        });
      });
    });
  }

  // Cree, si besoin, le conteneur de message d'erreur sous un champ.
  function createFieldMessage(field) {
    let message = field.nextElementSibling;

    if (!message || !message.classList.contains("field-message")) {
      message = document.createElement("p");
      message.className = "field-message";
      field.insertAdjacentElement("afterend", message);
    }

    return message;
  }

  // Affiche l'etat visuel valide/invalide d'un champ de formulaire.
  function setFieldState(field, message) {
    const fieldMessage = createFieldMessage(field);
    const hasError = Boolean(message);

    field.classList.toggle("is-invalid", hasError);
    field.classList.toggle("is-valid", !hasError && field.value.trim() !== "");
    fieldMessage.textContent = message;
    fieldMessage.classList.toggle("is-visible", hasError);
  }

  // Controle un champ du formulaire : requis, email valide et message assez long.
  function validateContactField(field) {
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      return "Ce champ est requis.";
    }

    if (field.type === "email" && !emailRegex.test(value)) {
      return "Veuillez saisir une adresse email valide.";
    }

    if (field.id === "message" && value.length < 20) {
      return "Le message doit contenir au moins 20 caracteres.";
    }

    return "";
  }

  // Gere la validation complete du formulaire de contact et le message de succes.
  function initContactValidation() {
    if (!contactForm) {
      return;
    }

    const fields = contactForm.querySelectorAll("input, select, textarea");
    const successMessage = document.createElement("p");
    successMessage.className = "form-success";
    successMessage.textContent = "Votre message a bien ete envoye. Merci pour votre prise de contact.";
    contactForm.appendChild(successMessage);

    fields.forEach((field) => {
      createFieldMessage(field);
      field.addEventListener("input", () => {
        setFieldState(field, validateContactField(field));
        successMessage.classList.remove("is-visible");
      });
      field.addEventListener("change", () => {
        setFieldState(field, validateContactField(field));
        successMessage.classList.remove("is-visible");
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      let isFormValid = true;

      fields.forEach((field) => {
        const errorMessage = validateContactField(field);
        setFieldState(field, errorMessage);

        if (errorMessage) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        successMessage.classList.add("is-visible");
        contactForm.reset();
        fields.forEach((field) => {
          field.classList.remove("is-valid", "is-invalid");
        });
      } else {
        successMessage.classList.remove("is-visible");
      }
    });
  }

  // Initialisation immediate des fonctionnalites globales.
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  updateScrollEffects();
  initFreelanceFilters();
  initContactValidation();

  // Prepare les elements qui apparaitront en fade-in au scroll.
  revealItems.forEach((item) => {
    item.setAttribute("data-reveal", "");
  });

  // Prepare les compteurs avant leur animation.
  counters.forEach((counter) => {
    counter.dataset.counterValue = counter.textContent.trim();
    counter.textContent = "0";
  });

  // IntersectionObserver declenche les fade-in et les compteurs au bon moment.
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
    // Fallback simple pour les anciens navigateurs.
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counters.forEach((counter) => animateCounter(counter));
  }

  // Bouton de bascule du theme, avec persistance via localStorage.
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  // Retour fluide en haut de page.
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // Ecoute du scroll pour les effets de navigation.
  window.addEventListener("scroll", updateScrollEffects);
});
