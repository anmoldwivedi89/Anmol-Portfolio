/**
 * tech-orbit.js
 * Animates 8 tech logo icons in a circular orbit around .hero-img-frame
 * Pure rAF + absolute positioning — guaranteed to work
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────────────────── */
  var ICONS = [
    { label: 'HTML5',      abbr: 'H5',  color: '#E34F26',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/html5/html5-original.svg' },
    { label: 'CSS3',       abbr: 'C3',  color: '#264DE4',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/css3/css3-original.svg' },
    { label: 'JavaScript', abbr: 'JS',  color: '#F7DF1E',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/javascript/javascript-original.svg' },
    { label: 'React',      abbr: '⚛',  color: '#61DAFB',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/react/react-original.svg' },
    { label: 'Firebase',   abbr: '🔥',  color: '#FFCA28',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/firebase/firebase-original.svg' },
    { label: 'Git',        abbr: 'Git', color: '#F05032',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/git/git-original.svg' },
    { label: 'Bootstrap',  abbr: 'B',   color: '#7952B3',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/bootstrap/bootstrap-original.svg' },
    { label: 'Vercel',     abbr: '▲',   color: '#ffffff', invertDark: true,
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/vercel/vercel-original.svg' },
  ];

  var RADIUS      = 175;   // px from frame center to icon center
  var ICON_SIZE   = 44;    // px — diameter of glass bubble
  var DURATION_MS = 28000; // 28 s per revolution
  var N           = ICONS.length;
  var HALF        = ICON_SIZE / 2;
  var PI2         = Math.PI * 2;
  var START       = -Math.PI / 2; // begin at top

  /* ── State ──────────────────────────────────────────────────────────────── */
  var frame   = null;
  var hub     = null;
  var iconEls = [];
  var rafId   = null;
  var paused  = false;
  var elapsed = 0;
  var lastTs  = null;

  /* ── Vercel filter ───────────────────────────────────────────────────────── */
  function vercelFilter(img) {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    img.style.filter = light ? 'none' : 'invert(1) brightness(1.3)';
  }

  /* ── Build DOM ───────────────────────────────────────────────────────────── */
  function build() {
    // Clean up previous hub
    var old = document.getElementById('techOrbitHub');
    if (old) old.remove();
    iconEls = [];

    hub = document.createElement('div');
    hub.id = 'techOrbitHub';
    hub.className = 'tech-orbit-hub';

    // Track ring (sized after layout)
    var track = document.createElement('div');
    track.className = 'orbit-track';
    hub.appendChild(track);

    // Icon bubbles
    ICONS.forEach(function (icon) {
      var wrap = document.createElement('div');
      wrap.className = 'orbit-icon-wrap';
      wrap.title = icon.label;
      wrap.style.width  = ICON_SIZE + 'px';
      wrap.style.height = ICON_SIZE + 'px';

      var inner = document.createElement('div');
      inner.className = 'orbit-icon-inner';

      var img = document.createElement('img');
      img.alt = icon.label;
      img.src = icon.src;
      if (icon.invertDark) {
        vercelFilter(img);
        new MutationObserver(function () { vercelFilter(img); })
          .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      }

      // Fallback letter badge when CDN fails
      img.onerror = function () {
        this.style.display = 'none';
        var fb = document.createElement('span');
        fb.className = 'orbit-fallback';
        fb.textContent = icon.abbr;
        fb.style.color = icon.color;
        inner.appendChild(fb);
      };

      inner.appendChild(img);
      wrap.appendChild(inner);

      // Hover glow
      wrap.addEventListener('mouseenter', function () {
        this.style.borderColor = icon.color;
        this.style.boxShadow   = '0 0 20px ' + icon.color + '55, 0 4px 24px rgba(0,0,0,0.6)';
        this._hov = true;
      });
      wrap.addEventListener('mouseleave', function () {
        this.style.borderColor = '';
        this.style.boxShadow   = '';
        this._hov = false;
      });

      hub.appendChild(wrap);
      iconEls.push(wrap);
    });

    // Insert hub before hero-chip
    var chip = frame.querySelector('.hero-chip');
    frame.insertBefore(hub, chip || null);
  }

  /* ── Size track ring ─────────────────────────────────────────────────────── */
  function sizeTrack() {
    var fw = frame.offsetWidth;
    var fh = frame.offsetHeight;
    var d  = (RADIUS + HALF) * 2;
    var track = hub.querySelector('.orbit-track');
    track.style.width  = d + 'px';
    track.style.height = d + 'px';
    track.style.left   = (fw / 2 - d / 2) + 'px';
    track.style.top    = (fh / 2 - d / 2) + 'px';
  }

  /* ── rAF animation ───────────────────────────────────────────────────────── */
  function tick(ts) {
    if (paused) { rafId = null; return; }

    if (lastTs === null) lastTs = ts;
    elapsed += ts - lastTs;
    lastTs = ts;

    var fw  = frame.offsetWidth  || 320;
    var fh  = frame.offsetHeight || 320;
    var cx  = fw / 2;
    var cy  = fh / 2;
    var ang = START + (elapsed % DURATION_MS) / DURATION_MS * PI2;

    for (var i = 0; i < iconEls.length; i++) {
      if (iconEls[i]._hov) continue;   // freeze hovered icon in place
      var a = ang + (i / N) * PI2;
      iconEls[i].style.left = (cx + RADIUS * Math.cos(a) - HALF) + 'px';
      iconEls[i].style.top  = (cy + RADIUS * Math.sin(a) - HALF) + 'px';
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ── Pause on hidden tab ─────────────────────────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
      lastTs = null;
    } else {
      paused = false;
      lastTs = null;
      rafId  = requestAnimationFrame(tick);
    }
  });

  /* ── Resize ──────────────────────────────────────────────────────────────── */
  var rTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(sizeTrack, 250);
  });

  /* ── Init (after full layout) ────────────────────────────────────────────── */
  function init() {
    frame = document.querySelector('.hero-img-frame');
    if (!frame) return;

    build();

    // Poll until frame has real layout dimensions
    function waitLayout() {
      if (frame.offsetWidth > 0 && frame.offsetHeight > 0) {
        sizeTrack();
        rafId = requestAnimationFrame(tick);
      } else {
        requestAnimationFrame(waitLayout);
      }
    }
    waitLayout();
  }

  // Ensure full page layout is done (window.load)
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
