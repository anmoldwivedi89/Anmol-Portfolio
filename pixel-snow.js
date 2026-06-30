/**
 * PixelSnow — Realistic Snow Edition
 * Snow-like colors (ice-white → cool blue), twinkle, wobble, glow
 * direction=125°, multi-layer parallax
 */
(function () {
  'use strict';

  // ── Canvas ────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'pixel-snow-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
    display: 'block',
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  // ── Settings ──────────────────────────────────────────────────────────────
  const DIRECTION_DEG = 125;
  const BASE_SPEED    = 0.55;
  const LAYERS        = 7;
  const FLAKES_LAYER  = 55;
  const DIR_RAD       = (DIRECTION_DEG * Math.PI) / 180;
  const DX            = Math.cos(DIR_RAD);   // ~-0.574
  const DY            = Math.sin(DIR_RAD);   // ~+0.819

  // ── Snow color palette (realistic ice/snow tones) ─────────────────────────
  // Near layers: bright ice-white with warm shimmer
  // Far layers:  cool blue-grey (like distant snowfall)
  const SNOW_COLORS = [
    { r: 255, g: 255, b: 255 },   // pure white       — layer 0 (nearest)
    { r: 220, g: 238, b: 255 },   // ice white-blue
    { r: 190, g: 220, b: 255 },   // soft ice blue
    { r: 170, g: 205, b: 245 },   // cool blue-grey
    { r: 150, g: 190, b: 235 },   // deeper blue
    { r: 130, g: 175, b: 225 },   // misty blue
    { r: 115, g: 160, b: 215 },   // far snowfall blue
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let W = 0, H = 0;
  let paused = false;
  let rafId  = null;
  let time   = 0;

  // Pre-bucketed layers
  const layerBuckets = Array.from({ length: LAYERS }, () => []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  function makeFlake(layer) {
    const depth  = (layer + 1) / LAYERS;     // 0 → 1 (near → far)
    const col    = SNOW_COLORS[layer] || SNOW_COLORS[SNOW_COLORS.length - 1];

    // Size: near = 3-6px squares, far = 1-2px
    const size    = rand(1.5, 6) * (1 - depth * 0.72);

    // Speed with slight randomness per flake
    const speed   = BASE_SPEED * (1 - depth * 0.68) * rand(0.6, 1.4);

    // Opacity: near bright, far dim
    const baseOpacity = rand(0.25, 0.9) * (1 - depth * 0.55);

    // Twinkle: each flake has its own phase & frequency
    const twinklePhase = rand(0, Math.PI * 2);
    const twinkleFreq  = rand(0.4, 1.8);    // cycles/sec

    // Wobble: subtle sine drift perpendicular to direction
    const wobbleAmp   = rand(0, 0.18);      // px amplitude
    const wobbleFreq  = rand(0.2, 0.9);
    const wobblePhase = rand(0, Math.PI * 2);

    return {
      x: rand(-60, W + 60),
      y: rand(-60, H + 60),
      size, speed, baseOpacity,
      twinklePhase, twinkleFreq,
      wobbleAmp, wobbleFreq, wobblePhase,
      r: col.r, g: col.g, b: col.b,
      // Occasional sparkle flakes (bright burst)
      isSpark: Math.random() < 0.08 && layer <= 1,
    };
  }

  function respawn(f) {
    // Re-enter from top or right (snow falls down-left at 125°)
    if (Math.random() < 0.55) {
      f.x = rand(-80, W + 80);
      f.y = -f.size - rand(0, 60);
    } else {
      f.x = W + f.size + rand(0, 60);
      f.y = rand(-80, H + 80);
    }
  }

  // ── Init / Resize ─────────────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initFlakes() {
    for (let l = 0; l < LAYERS; l++) {
      layerBuckets[l].length = 0;
      for (let i = 0; i < FLAKES_LAYER; i++) {
        layerBuckets[l].push(makeFlake(l));
      }
    }
  }

  window.addEventListener('resize', () => { resize(); initFlakes(); });
  resize();
  initFlakes();

  // ── Page Visibility ───────────────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && rafId === null) render();
  });

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    if (paused) { rafId = null; return; }

    time += 1 / 60;  // ~seconds at 60fps
    ctx.clearRect(0, 0, W, H);

    const isLight     = document.documentElement.getAttribute('data-theme') === 'light';
    const globalAlpha = isLight ? 0.18 : 1.0;

    // Far layers first (painter's algorithm)
    for (let l = LAYERS - 1; l >= 0; l--) {
      const bucket = layerBuckets[l];

      for (let i = 0; i < bucket.length; i++) {
        const f = bucket[i];

        // ── Movement ──────────────────────────────────────────────────────
        // Perpendicular wobble direction (90° from travel dir)
        const wobble = Math.sin(time * f.wobbleFreq * Math.PI * 2 + f.wobblePhase) * f.wobbleAmp;
        f.x += DX * f.speed + (-DY * wobble);
        f.y += DY * f.speed + ( DX * wobble);

        // Respawn when off screen
        if (f.y > H + 30 || f.x < -30 || f.x > W + 30) {
          respawn(f);
          continue;
        }

        // ── Twinkle (opacity pulse) ───────────────────────────────────────
        const twinkle = 0.55 + 0.45 * Math.sin(
          time * f.twinkleFreq * Math.PI * 2 + f.twinklePhase
        );
        const alpha = f.baseOpacity * twinkle * globalAlpha;

        // ── Pixel coords (crisp integer snap) ────────────────────────────
        const px = Math.round(f.x);
        const py = Math.round(f.y);
        const ps = Math.max(1, Math.round(f.size));

        // ── Draw core pixel ───────────────────────────────────────────────
        ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},${alpha.toFixed(3)})`;
        ctx.fillRect(px, py, ps, ps);

        // ── Glow halo on near + medium flakes ────────────────────────────
        if (l <= 2 && f.size > 2.5) {
          const glowAlpha = alpha * 0.2;
          const pad = 1;
          ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},${glowAlpha.toFixed(3)})`;
          ctx.fillRect(px - pad, py - pad, ps + pad * 2, ps + pad * 2);

          // Extra outer glow for very large near flakes
          if (l === 0 && f.size > 4) {
            const outerAlpha = alpha * 0.08;
            ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},${outerAlpha.toFixed(3)})`;
            ctx.fillRect(px - 2, py - 2, ps + 4, ps + 4);
          }
        }

        // ── Sparkle cross (+) on spark flakes ─────────────────────────────
        if (f.isSpark && twinkle > 0.8) {
          const sparkAlpha = alpha * 0.5 * (twinkle - 0.8) / 0.2;
          ctx.fillStyle = `rgba(255,255,255,${sparkAlpha.toFixed(3)})`;
          // Horizontal arm
          ctx.fillRect(px - 2, py + Math.floor(ps / 2), ps + 4, 1);
          // Vertical arm
          ctx.fillRect(px + Math.floor(ps / 2), py - 2, 1, ps + 4);
        }
      }
    }

    rafId = requestAnimationFrame(render);
  }

  render();

})();
