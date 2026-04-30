const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const cursorGlow = document.querySelector(".cursor-glow");
const preloader = document.querySelector(".preloader");
const scrollProgress = document.querySelector(".scroll-progress");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".desktop-nav a, .mobile-menu a");
const galleryGrid = document.querySelector("#projectGrid");
const galleryFilters = document.querySelector("#galleryFilters");
const galleryStatus = document.querySelector("#galleryStatus");
const projectCountMetric = document.querySelector("[data-project-count]");
const nicheCountMetric = document.querySelector("[data-niche-count]");

const galleryApiConfig = {
  baseUrl: "http://localhost:3333",
  publicPath: "/api/v1/portfolio-items",
  status: "published",
  featuredOnly: false,
  limit: 50,
  timeout: 15000,
  ...(window.CODEXA_GALLERY_API || {})
};

const isFinePointer = window.matchMedia("(pointer: fine)").matches;
const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==============================
   Menu mobile
   ============================== */

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* ==============================
   Cursor, scroll e navegação
   ============================== */

let cursorX = 0;
let cursorY = 0;
let cursorFrame = null;

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow || window.innerWidth < 900) return;

  cursorX = event.clientX;
  cursorY = event.clientY;

  if (cursorFrame) return;

  cursorFrame = requestAnimationFrame(() => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.left = `${cursorX}px`;
    cursorGlow.style.top = `${cursorY}px`;
    cursorFrame = null;
  });
}, { passive: true });

window.addEventListener("load", () => {
  window.setTimeout(() => {
    preloader?.classList.add("is-hidden");
  }, 520);
});

const updateScrollUI = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  header?.classList.toggle("is-scrolled", scrollTop > 30);
};

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

const sections = [...document.querySelectorAll("main section[id]")];
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === `#${entry.target.id}`);
    });
  });
}, {
  rootMargin: "-38% 0px -55% 0px",
  threshold: 0.01
});

sections.forEach((section) => navObserver.observe(section));

/* ==============================
   Revelação e métricas
   ============================== */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });

const observeReveal = (root = document) => {
  root.querySelectorAll?.(".reveal:not(.visible)").forEach((item) => revealObserver.observe(item));
};

observeReveal();

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const element = entry.target;
    const original = element.textContent.trim();
    const numeric = parseInt(original.replace(/\D/g, ""), 10);

    if (!numeric || element.dataset.counted === "true") return;

    element.dataset.counted = "true";

    const prefix = original.startsWith("+") ? "+" : "";
    const suffix = original.includes("%") ? "%" : "";
    const hasLeadingZero = /^0\d/.test(original);
    const duration = 1000;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(numeric * eased);
      const formatted = hasLeadingZero && current < 10 ? `0${current}` : String(current);
      element.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = original;
      }
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.55 });

const observeCounters = () => {
  document.querySelectorAll(".metrics strong").forEach((counter) => {
    counterObserver.unobserve(counter);
    counterObserver.observe(counter);
  });
};

observeCounters();

/* ==============================
   Integração API - Galeria
   ============================== */

const normalizeText = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

const toFilterKey = (value = "") => normalizeText(value)
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "outros";

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const safeUrl = (value = "") => {
  const url = String(value || "").trim();
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^mailto:/i.test(url)) return url;
  if (/^tel:/i.test(url)) return url;
  return "#";
};

const safeImage = (value = "") => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (/^data:image\//i.test(src)) return src;
  if (/^assets\//i.test(src)) return src;
  return "";
};

const iconByCategory = (category = "") => {
  const key = normalizeText(category);

  if (key.includes("advoc")) return "⚖";
  if (key.includes("rest") || key.includes("gastr") || key.includes("food")) return "🍝";
  if (key.includes("clinic") || key.includes("odont") || key.includes("saude")) return "✦";
  if (key.includes("joia") || key.includes("semi")) return "◇";
  if (key.includes("barbear") || key.includes("beleza")) return "✂";
  if (key.includes("foto")) return "⌁";

  return "↗";
};

const buildGalleryApiUrl = () => {
  const base = galleryApiConfig.baseUrl || window.location.origin;
  const path = galleryApiConfig.publicPath || "/api/v1/portfolio-items";
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);

  if (galleryApiConfig.status) {
    url.searchParams.set("status", galleryApiConfig.status);
  }

  if (galleryApiConfig.featuredOnly) {
    url.searchParams.set("featured", "true");
  }

  if (galleryApiConfig.limit) {
    url.searchParams.set("limit", String(galleryApiConfig.limit));
  }

  return url.toString();
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = Number(galleryApiConfig.timeout || 15000);
  const timer = window.setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timer);
  }
};

const setGalleryStatus = (type, message) => {
  if (!galleryStatus) return;

  galleryStatus.classList.remove("gallery-status--error", "gallery-status--success", "gallery-status--empty");

  if (type) {
    galleryStatus.classList.add(`gallery-status--${type}`);
  }

  galleryStatus.hidden = !message;
  galleryStatus.querySelector("p").textContent = message || "";
};

const sortProjects = (items) => [...items].sort((a, b) => {
  const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 9999;
  const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 9999;
  return orderA - orderB;
});

const createProjectCard = (item, index) => {
  const categoryLabel = item.category || "Projeto";
  const categoryKey = toFilterKey(categoryLabel);
  const imageSrc = safeImage(item.desktopImageUrl || item.mobileImageUrl);
  const projectHref = safeUrl(item.projectUrl);
  const linkTarget = projectHref === "#" ? "" : ' target="_blank" rel="noopener"';
  const title = item.title || "Projeto Codexa";
  const description = item.shortDescription || "Projeto desenvolvido pela Codexa.";
  const alt = item.altText || `Preview do projeto ${title}`;
  const wideClass = index % 2 === 1 ? " project-card--wide" : "";

  return `
    <article class="project-card reveal${wideClass} tilt-card" data-tilt data-category="${escapeHtml(categoryKey)}">
      <div class="project-image">
        <div class="browser-dots"><span></span><span></span><span></span></div>
        ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(alt)}" loading="lazy" />` : `<div class="project-image-placeholder">Sem imagem</div>`}
      </div>
      <div class="project-info">
        <div class="project-icon">${escapeHtml(iconByCategory(categoryLabel))}</div>
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
          <span>${escapeHtml(categoryLabel)}</span>
        </div>
        <a href="${escapeHtml(projectHref)}"${linkTarget} aria-label="Abrir projeto ${escapeHtml(title)}">↗</a>
      </div>
    </article>
  `;
};

const updateGalleryMetrics = (items) => {
  const projectTotal = items.length;
  const categories = new Set(items.map((item) => toFilterKey(item.category || "outros")));

  if (projectCountMetric) {
    projectCountMetric.textContent = String(projectTotal).padStart(2, "0");
    projectCountMetric.dataset.counted = "false";
  }

  if (nicheCountMetric) {
    nicheCountMetric.textContent = String(categories.size).padStart(2, "0");
    nicheCountMetric.dataset.counted = "false";
  }
};

const renderFilters = (items) => {
  if (!galleryFilters) return;

  const categories = new Map();

  items.forEach((item) => {
    const label = item.category || "Outros";
    const key = toFilterKey(label);

    if (!categories.has(key)) {
      categories.set(key, label);
    }
  });

  const filters = [
    `<button class="filter magnetic active" data-filter="todos" type="button">Todos</button>`,
    ...[...categories.entries()].map(([key, label]) => (
      `<button class="filter magnetic" data-filter="${escapeHtml(key)}" type="button">${escapeHtml(label)}</button>`
    ))
  ];

  galleryFilters.innerHTML = filters.join("\n");
  bindFilterEvents();
  applyPressFeedback(galleryFilters.querySelectorAll(".filter"));
};

const animateVisibleCards = () => {
  const cards = galleryGrid?.querySelectorAll(".project-card:not(.hidden)") || [];

  cards.forEach((card, index) => {
    card.classList.remove("is-entering");
    void card.offsetWidth;
    card.style.animationDelay = `${index * 55}ms`;
    card.classList.add("is-entering");

    window.setTimeout(() => {
      card.classList.remove("is-entering");
      card.style.animationDelay = "";
    }, 620);
  });
};

const bindFilterEvents = () => {
  galleryFilters?.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      galleryFilters.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      galleryGrid?.querySelectorAll(".project-card").forEach((card) => {
        const shouldShow = filter === "todos" || card.dataset.category === filter;
        card.classList.toggle("hidden", !shouldShow);
      });

      animateVisibleCards();
    });
  });
};

const renderGallery = (items) => {
  if (!galleryGrid) return;

  if (!items.length) {
    galleryGrid.innerHTML = "";
    setGalleryStatus("empty", "Nenhum projeto publicado foi encontrado na API.");
    updateGalleryMetrics([]);
    renderFilters([]);
    return;
  }

  const orderedItems = sortProjects(items);
  galleryGrid.innerHTML = orderedItems.map(createProjectCard).join("\n");

  renderFilters(orderedItems);
  updateGalleryMetrics(orderedItems);
  observeCounters();
  setGalleryStatus("success", "");
  observeReveal(galleryGrid);
  bindTiltHints(galleryGrid.querySelectorAll(".project-card"));
  applyPressFeedback(document.querySelectorAll(".btn, .header-cta, .filter"));
  animateVisibleCards();
};

const loadGalleryProjects = async () => {
  if (!galleryGrid) return;

  setGalleryStatus("", "Carregando projetos da galeria...");

  try {
    const response = await fetchWithTimeout(buildGalleryApiUrl());
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = result?.error?.message || "Não foi possível carregar os projetos da API.";
      throw new Error(message);
    }

    const items = Array.isArray(result.data) ? result.data : [];
    renderGallery(items);
  } catch (error) {
    console.error("Erro ao carregar galeria:", error);
    galleryGrid.innerHTML = "";
    setGalleryStatus("error", `Não foi possível carregar a galeria pela API. ${error.message || "Verifique a URL configurada."}`);
    updateGalleryMetrics([]);
  }
};

/* ==============================
   Interações premium otimizadas
   ============================== */

const bindTiltHints = (cards) => {
  if (!isFinePointer || !canAnimate) return;

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      card.style.willChange = "transform";
    });

    card.addEventListener("pointerleave", () => {
      card.style.willChange = "auto";
    });
  });
};

const applyPressFeedback = (elements) => {
  elements.forEach((element) => {
    if (element.dataset.pressBound === "true") return;
    element.dataset.pressBound = "true";

    element.addEventListener("pointerdown", () => {
      element.style.transform = "scale(.985)";
    });

    element.addEventListener("pointerup", () => {
      element.style.transform = "";
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
};

bindTiltHints(document.querySelectorAll(".featured-window"));
applyPressFeedback(document.querySelectorAll(".btn, .header-cta, .filter"));
loadGalleryProjects();
