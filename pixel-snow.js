/**
 * PixelSnow — Canvas 2D (Production Ready)
 * direction=125°, speed=0.6, 6 depth layers, 60 flakes/layer
 * Fixes: pre-bucketed layers, Page Visibility API, no per-frame filter()
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
    zIndex: '0',           // behind body::before noise overlay (z-index:0 same layer, canvas first = behind)
    display: 'block',
  });
  // Insert as very first child so it renders behind everything
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  // ── Settings ──────────────────────────────────────────────────────────────
  const DIRECTION_DEG = 125;
  const SPEED         = 0.6;
  const LAYERS        = 6;
  const FLAKES_LAYER  = 60;                         // per layer
  const DIR_RAD       = (DIRECTION_DEG * Math.PI) / 180;
  const DX            = Math.cos(DIR_RAD);          // ~-0.574
  const DY            = Math.sin(DIR_RAD);          // ~+0.819

  // ── State ─────────────────────────────────────────────────────────────────
  let W = 0, H = 0;
  let paused = false;
  let rafId  = null;

  // Pre-bucketed layers: layerBuckets[l] = array of flake objects
  const layerBuckets = Array.from({ length: LAYERS }, () => []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function rand(min, max) { return min + Math.random() * (max - min); }

  function makeFlake(layer) {
    const depth   = (layer + 1) / LAYERS;
    const size    = rand(2, 5) * (1 - depth * 0.6);
    const speed   = SPEED * (1 - depth * 0.7) * rand(0.7, 1.3);
    const opacity = rand(0.08, 0.45) * (1 - depth * 0.5);
    return {
      x: rand(-50, W + 50),
      y: rand(-50, H + 50),
      size, speed, opacity,
    };
  }

  function respawn(f) {
    // Re-enter from top or right edge (direction is down-left)
    if (Math.random() < 0.5) {
      f.x = rand(-100, W + 100);
      f.y = -f.size - rand(0, 50);
    } else {
      f.x = W + f.size + rand(0, 50);
      f.y = rand(-100, H + 100);
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

  // ── Page Visibility — pause when tab hidden ───────────────────────────────
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && rafId === null) render();
  });

  // ── Render loop ───────────────────────────────────────────────────────────
  function render() {
    if (paused) { rafId = null; return; }

    ctx.clearRect(0, 0, W, H);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const globalOpacity = isLight ? 0.2 : 1.0;

    // Draw far layers first, then near (painter's algorithm)
    for (let l = LAYERS - 1; l >= 0; l--) {
      const bucket = layerBuckets[l];

      for (let i = 0; i < bucket.length; i++) {
        const f = bucket[i];

        // Move
        f.x += DX * f.speed;
        f.y += DY * f.speed;

        // Respawn when off screen
        if (f.y > H + 20 || f.x < -20) {
          respawn(f);
          continue;
        }

        // Draw square pixel (snapped to integer coords for crisp pixel art look)
        const alpha = f.opacity * globalOpacity;
        const px = Math.round(f.x);
        const py = Math.round(f.y);
        const ps = Math.max(1, Math.round(f.size));

        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillRect(px, py, ps, ps);

        // Soft glow ring on the largest near-layer flakes only
        if (l === 0 && f.size > 3.5) {
          ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.12).toFixed(3)})`;
          ctx.fillRect(px - 1, py - 1, ps + 2, ps + 2);
        }
      }
    }

    rafId = requestAnimationFrame(render);
  }

  render();

})();
