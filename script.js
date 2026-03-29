document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // ── Advanced Tilt Effect for Project Cards ──────────────────────────
  const tiltCards = document.querySelectorAll('[data-tilt="true"]');
  
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * 15;
      const rotateY = ((x - centerX) / centerX) * -15;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
  });

  // ── Scroll Trigger Offset Animations ──────────────────────────────
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px"
  };

  const offsetObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0) rotateZ(0deg)";
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-reveal="true"]').forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px) rotateZ(1deg)";
    el.style.transition = "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
    offsetObserver.observe(el);
  });

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

  sr.reveal(".badge", { origin: "top" });
  sr.reveal("#hero h1", { delay: 300, scale: 0.8 });
  sr.reveal("#hero p", { delay: 500 });
  sr.reveal(".cta-buttons", { delay: 700, origin: "bottom" });
  sr.reveal(".about-image-wrapper", {
    origin: "left",
    distance: "100px",
    delay: 200,
  });
  sr.reveal(".about-text", { origin: "right", distance: "100px", delay: 400 });
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

  // ── Pause Floating Animations on Hover ──────────────────────────
  const floatingElements = document.querySelectorAll('[data-float="true"], [data-float-badge="true"]');
  
  floatingElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.style.animationPlayState = "paused";
    });
    
    el.addEventListener("mouseleave", () => {
      el.style.animationPlayState = "running";
    });
  });

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
  item.addEventListener("click", () => {
    navLinks.classList.remove("active");
    const icon = menuBtn.querySelector("i");
    icon.setAttribute("data-lucide", "menu");
    lucide.createIcons();
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
