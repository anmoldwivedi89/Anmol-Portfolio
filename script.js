document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // ── Theme Toggle ───────────────────────────────────────────────────────
  const toggleBtn = document.getElementById("themeToggleBtn");
  const html = document.documentElement;

  // Load saved preference (default: dark)
  const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  if (savedTheme === "light") html.setAttribute("data-theme", "light");

  function setTheme(theme) {
    if (theme === "light") {
      html.setAttribute("data-theme", "light");
    } else {
      html.removeAttribute("data-theme");
    }
    localStorage.setItem("portfolio-theme", theme);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(current);
    });
  }
  // ──────────────────────────────────────────────────────────────────────

  // Initialize ScrollReveal
  const sr = ScrollReveal({
    origin: "bottom",
    distance: "40px",
    duration: 1200,
    delay: 150,
    rotate: { x: 0, y: 0, z: 0 },
    opacity: 0,
    scale: 0.9,
    easing: "cubic-bezier(0.5, 0, 0, 1)",
    mobile: true,
    reset: false,
  });

  sr.reveal(".hero-eyebrow", { origin: "left", delay: 100 });
  sr.reveal(".hero-name", { delay: 250, scale: 0.88 });
  sr.reveal(".hero-role", { delay: 380 });
  sr.reveal(".hero-desc", { delay: 480 });
  sr.reveal(".hero-actions", { delay: 580, origin: "bottom" });
  sr.reveal(".hero-stats", { delay: 700, origin: "bottom" });
  sr.reveal(".hero-right", { origin: "right", distance: "80px", delay: 300 });
  sr.reveal(".about-text", { origin: "left", distance: "60px", delay: 200 });
  sr.reveal(".skills-grid-solo", { origin: "right", distance: "60px", delay: 350 });
  sr.reveal(".stat-item", { interval: 150, origin: "bottom", delay: 400 });
  sr.reveal(".timeline-card", { interval: 300, origin: "left" });
  sr.reveal(".project-card", { interval: 300, scale: 0.85 });
  sr.reveal(".service-card", {
    interval: 200,
    origin: "bottom",
    distance: "50px",
  });
  sr.reveal(".contact-card", { delay: 200, scale: 0.95 });
  sr.reveal(".contact-item", { interval: 150, origin: "bottom" });
  sr.reveal(".ach-card", { origin: "bottom", distance: "50px", delay: 200, scale: 0.92 });

  // Mouse Tracking Glow Effect for Service Cards
  const cards = document.querySelectorAll(".service-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // ── Achievements Lightbox ──────────────────────────────────────────────
  const achModal  = document.getElementById("achModal");
  const viewBtn   = document.getElementById("viewAchievementBtn");
  const hackThumb = document.getElementById("hackathonThumb");
  const closeBtn  = document.getElementById("achModalClose");
  const backdrop  = document.getElementById("achModalBackdrop");

  function openAchModal() {
    achModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    lucide.createIcons();
  }

  function closeAchModal() {
    achModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  if (viewBtn)   viewBtn.addEventListener("click", openAchModal);
  if (hackThumb) hackThumb.addEventListener("click", openAchModal);
  if (closeBtn)  closeBtn.addEventListener("click", closeAchModal);
  if (backdrop)  backdrop.addEventListener("click", closeAchModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAchModal();
  });
});

// Mobile Menu Toggle logic
const menuBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");
const navLinkItems = document.querySelectorAll(".nav-links a");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = menuBtn.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.setAttribute("data-lucide", "x");
    } else {
      icon.setAttribute("data-lucide", "menu");
    }
    lucide.createIcons();
  });
}

// Close menu when a link is clicked
navLinkItems.forEach((item) => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('active');
    if (!menuBtn) return;                        // guard: no crash if nav absent
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    }
  });
});

// Profile Image Toggle Animation
const profileImg = document.querySelector(".profile-img");
if (profileImg) {
  let isAnimating = false;

  const toggleImage = function (e) {
    if (isAnimating) return;
    isAnimating = true;

    this.classList.toggle("flipped");
    this.classList.add("flipping");

    setTimeout(() => {
      if (this.classList.contains("flipped")) {
        this.src = "profile.png?v=4";
      } else {
        this.src = "profile1.png";
      }
    }, 300);

    setTimeout(() => {
      this.classList.remove("flipping");
      isAnimating = false;
    }, 600);
  };

  profileImg.addEventListener("click", toggleImage);
}
