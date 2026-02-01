document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Initialize ScrollReveal
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '40px',
        duration: 1200,
        delay: 150,
        rotate: { x: 0, y: 0, z: 0 },
        opacity: 0,
        scale: 0.9,
        easing: 'cubic-bezier(0.5, 0, 0, 1)',
        mobile: true,
        reset: false
    });

    sr.reveal('.badge', { origin: 'top' });
    sr.reveal('#hero h1', { delay: 300, scale: 0.8 });
    sr.reveal('#hero p', { delay: 500 });
    sr.reveal('.cta-buttons', { delay: 700, origin: 'bottom' });
    sr.reveal('.about-image-wrapper', { origin: 'left', distance: '100px', delay: 200 });
    sr.reveal('.about-text', { origin: 'right', distance: '100px', delay: 400 });
    sr.reveal('.timeline-card', { interval: 300, origin: 'left' });
    sr.reveal('.project-card', { interval: 300, scale: 0.85 });
    sr.reveal('.contact-card', { delay: 200, scale: 0.95 });
    sr.reveal('.contact-item', { interval: 150, origin: 'bottom' });

});

// Mobile Menu Toggle logic
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-links a');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });
}

// Close menu when a link is clicked
navLinkItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});


