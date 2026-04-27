const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const cursorGlow = document.querySelector(".cursor-glow");
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".project-card");
const revealItems = document.querySelectorAll(".reveal");

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

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    cards.forEach((card) => {
      const shouldShow = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("hidden", !shouldShow);
    });
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });

revealItems.forEach((item) => observer.observe(item));



/* ==============================
   Premium interactions & events
   ============================== */

const preloader = document.querySelector(".preloader");
const scrollProgress = document.querySelector(".scroll-progress");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".desktop-nav a, .mobile-menu a");
const tiltCards = document.querySelectorAll("[data-tilt]");
const premiumHoverItems = document.querySelectorAll(".featured-window, .project-card, .step, .metrics, .cta");
const magneticItems = document.querySelectorAll(".magnetic");

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







filters.forEach((button) => {
  button.addEventListener("click", () => {
    cards.forEach((card, index) => {
      if (card.classList.contains("hidden")) return;

      card.classList.remove("is-entering");
      void card.offsetWidth;
      card.style.animationDelay = `${index * 55}ms`;
      card.classList.add("is-entering");

      window.setTimeout(() => {
        card.classList.remove("is-entering");
        card.style.animationDelay = "";
      }, 620);
    });
  });
});

const counters = document.querySelectorAll(".metrics strong");
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
    const duration = 1000;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(numeric * eased);
      element.textContent = `${prefix}${current}${suffix}`;

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

counters.forEach((counter) => counterObserver.observe(counter));


/* ==============================
   Optimized premium events
   ============================== */

const isFinePointer = window.matchMedia("(pointer: fine)").matches;
const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (isFinePointer && canAnimate) {
  document.querySelectorAll(".project-card, .featured-window").forEach((card) => {
    card.addEventListener("pointerenter", () => {
      card.style.willChange = "transform";
    });

    card.addEventListener("pointerleave", () => {
      card.style.willChange = "auto";
    });
  });
}

document.querySelectorAll(".btn, .header-cta, .filter").forEach((element) => {
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
