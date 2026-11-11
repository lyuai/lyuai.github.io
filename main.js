/* ==========================================================================
   LYU.ai — Interactive Optical Compiler, X-Ray Inspector & Theme Controller
   ========================================================================== */

/* ==========================================================================
   1. Optical Theme Controller (Dark Obsidian & Light Alabaster)
   ========================================================================== */

let currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

function applyTheme(theme, persist = true) {
  currentTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const meta = document.getElementById('meta-theme-color');
  if (meta) {
    meta.setAttribute('content', currentTheme === 'light' ? '#f4f7fc' : '#060911');
  }
  if (persist) {
    try {
      localStorage.setItem('lyu-theme', currentTheme);
    } catch (_) {}
  }
}

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
  });
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  try {
    if (!localStorage.getItem('lyu-theme')) {
      applyTheme(e.matches ? 'light' : 'dark', false);
    }
  } catch (_) {}
});

/* ==========================================================================
   2. Copy Email Micro-Interaction
   ========================================================================== */

document.querySelectorAll('.copy-email-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'hi@lyu.ai';
    const badge = btn.querySelector('.copy-badge');
    try {
      await navigator.clipboard.writeText(email);
      if (badge) {
        badge.textContent = 'Copied';
        badge.style.color = 'var(--accent-emerald)';
        setTimeout(() => {
          badge.textContent = 'Copy';
          badge.style.color = '';
        }, 1800);
      }
    } catch (_) {
      window.location.href = `mailto:${email}`;
    }
  });
});

/* ==========================================================================
   3. Pointer-Tracked Specular Spotlight Cards & Scroll Reveal
   ========================================================================== */

document.querySelectorAll('.spotlight-card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* Active Section Navigation Highlight */
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const sectionSpy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = `#${entry.target.id}`;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    });
  },
  { rootMargin: '-32% 0px -58% 0px' }
);
sections.forEach((sec) => sectionSpy.observe(sec));

/* ==========================================================================
   4. Structural X-Ray Loupe & Interactive Vector Node Inspector
   ========================================================================== */

(function initXRay() {
  const widget = document.getElementById('xray-widget');
  const stage = document.getElementById('xray-stage');
  const divider = document.getElementById('xray-divider');
  const presetBtns = document.querySelectorAll('[data-xray-set]');
  const nodeKeyEl = document.getElementById('inspector-node-id');
  const nodeValEl = document.getElementById('inspector-node-spec');
  if (!widget || !stage || !divider) return;

  let splitPct = 46;
  let dragging = false;

  function setSplit(pct, clearPresets = true) {
    splitPct = Math.max(5, Math.min(95, pct));
    widget.style.setProperty('--split', `${splitPct.toFixed(1)}%`);
    divider.setAttribute('aria-valuenow', String(Math.round(splitPct)));
    if (clearPresets) {
      presetBtns.forEach((b) => b.classList.remove('is-active'));
    }
  }

  function updateFromPointer(clientX) {
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(pct, true);
  }

  divider.addEventListener('pointerdown', (e) => {
    dragging = true;
    divider.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  divider.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    updateFromPointer(e.clientX);
  });

  divider.addEventListener('pointerup', () => {
    dragging = false;
  });

  divider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplit(splitPct - 4, true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplit(splitPct + 4, true);
    }
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = Number(btn.getAttribute('data-xray-set') || 46);
      setSplit(target, false);
      presetBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });

  const nodes = stage.querySelectorAll('.inspectable-node');
  nodes.forEach((node) => {
    const selectNode = () => {
      nodes.forEach((n) => n.classList.remove('is-selected'));
      node.classList.add('is-selected');
      if (nodeKeyEl && nodeValEl) {
        nodeKeyEl.textContent = node.getAttribute('data-node-id') || '';
        nodeValEl.textContent = node.getAttribute('data-node-spec') || '';
      }
    };
    node.addEventListener('pointerenter', selectNode);
    node.addEventListener('click', selectNode);
    node.addEventListener('focus', selectNode);
  });
})();

/* ==========================================================================
   5. Interactive 60Hz Optical Compiler Canvas Simulation
   ========================================================================== */

(function initOpticalBench() {
  const canvas = document.getElementById('optical-canvas');
  const telemetryEl = document.getElementById('stage-telemetry');
  const modeTabs = document.querySelectorAll('[data-stage-mode]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stageMode = 'convergence'; // 'convergence' | 'lattice' | 'wireframe'
  let isVisible = true;

  // Smooth pointer state (normalized 0..1)
  const pointer = { x: 0.34, y: 0.5, targetX: 0.34, targetY: 0.5, active: false };

  // 16 Spectral perception filaments
  const RAY_COUNT = 16;
  const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
    const norm = (i / (RAY_COUNT - 1)) * 2 - 1; // -1 .. 1
    return {
      index: i,
      norm,
      phase: i * 0.63 + (i % 3) * 0.4,
      freq: 1.4 + (i % 4) * 0.32,
      amp: 14 + (i % 5) * 4.5,
      speed: 0.72 + (i % 3) * 0.18,
      hueSlot: i % 3, // 0 cyan, 1 indigo, 2 ice/emerald
      targetSlot: i % 4, // routes into 4 compiled structural primitives on right
    };
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(300, rect.width);
    height = Math.max(240, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  const visObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.02 }
  );
  visObserver.observe(canvas);

  canvas.parentElement.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    pointer.targetY = Math.max(0.08, Math.min(0.92, (e.clientY - rect.top) / rect.height));
    pointer.active = true;
  });

  canvas.parentElement.addEventListener('pointerleave', () => {
    pointer.active = false;
    pointer.targetX = 0.36;
    pointer.targetY = 0.5;
  });

  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      stageMode = tab.getAttribute('data-stage-mode') || 'convergence';
      modeTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
    });
  });

  function drawVertexHandle(x, y, size, fill, stroke) {
    const half = size / 2;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.rect(x - half, y - half, size, size);
    ctx.fill();
    ctx.stroke();
  }

  function drawRoundedRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  let startTime = performance.now();

  function render(now) {
    requestAnimationFrame(render);
    if (!isVisible && !reducedMotion) return;

    const t = reducedMotion ? 1.8 : (now - startTime) * 0.001;
    pointer.x += (pointer.targetX - pointer.x) * 0.085;
    pointer.y += (pointer.targetY - pointer.y) * 0.085;

    const isLight = currentTheme === 'light';
    ctx.clearRect(0, 0, width, height);

    const palette = isLight
      ? {
          grid: 'rgba(15, 23, 42, 0.045)',
          rail: 'rgba(2, 132, 199, 0.22)',
          cyan: '#0284c7',
          indigo: '#4f46e5',
          emerald: '#059669',
          ink: '#0f172a',
          inkSoft: 'rgba(15, 23, 42, 0.58)',
          inkFaint: 'rgba(15, 23, 42, 0.18)',
          cardFill: 'rgba(255, 255, 255, 0.78)',
          cardStroke: 'rgba(15, 23, 42, 0.18)',
          handleFill: '#ffffff',
          lensFillA: 'rgba(56, 189, 248, 0.16)',
          lensFillB: 'rgba(99, 102, 241, 0.08)',
          lensStroke: 'rgba(2, 132, 199, 0.55)',
        }
      : {
          grid: 'rgba(255, 255, 255, 0.032)',
          rail: 'rgba(56, 189, 248, 0.22)',
          cyan: '#38bdf8',
          indigo: '#818cf8',
          emerald: '#34d399',
          ink: '#f8fafc',
          inkSoft: 'rgba(248, 250, 252, 0.66)',
          inkFaint: 'rgba(248, 250, 252, 0.16)',
          cardFill: 'rgba(13, 21, 38, 0.76)',
          cardStroke: 'rgba(255, 255, 255, 0.18)',
          handleFill: '#080d19',
          lensFillA: 'rgba(56, 189, 248, 0.18)',
          lensFillB: 'rgba(129, 140, 248, 0.07)',
          lensStroke: 'rgba(125, 211, 252, 0.62)',
        };

    // Subtle coordinate background grid
    const step = 36;
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = step; gx < width; gx += step) {
      ctx.moveTo(gx + 0.5, 0);
      ctx.lineTo(gx + 0.5, height);
    }
    for (let gy = step; gy < height; gy += step) {
      ctx.moveTo(0, gy + 0.5);
      ctx.lineTo(width, gy + 0.5);
    }
    ctx.stroke();

    // Key optical coordinates
    const lensX = Math.round(width * 0.455);
    const lensHalfW = Math.max(20, Math.min(34, width * 0.03));
    const lensTop = height * 0.185;
    const lensBottom = height * 0.9;
    const lensH = lensBottom - lensTop;
    const focalY = height * (0.39 + pointer.y * 0.26);

    // Subtle ambient caustic glow behind the refractive kernel
    const caustic = ctx.createRadialGradient(lensX + 18, focalY, 4, lensX + 24, focalY, Math.max(140, width * 0.22));
    caustic.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.11)' : 'rgba(56, 189, 248, 0.14)');
    caustic.addColorStop(0.5, isLight ? 'rgba(79, 70, 229, 0.04)' : 'rgba(129, 140, 248, 0.06)');
    caustic.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = caustic;
    ctx.fillRect(0, 0, width, height);

    // Update live telemetry angle
    const incidenceDeg = ((pointer.y - 0.5) * -28).toFixed(1);
    const sign = Number(incidenceDeg) >= 0 ? '+' : '';
    if (telemetryEl && Math.floor(now / 120) % 2 === 0) {
      const modeTag =
        stageMode === 'lattice'
          ? 'CONSTRAINT LATTICE'
          : stageMode === 'wireframe'
            ? 'VECTOR AST'
            : 'NATIVE AST';
      telemetryEl.textContent = `θ ${sign}${incidenceDeg}° · ε = 0.000 · ${modeTag}`;
    }

    // Compiled Artifact Layout Bounds on the Right Side
    const rightStart = lensX + lensHalfW + Math.max(28, width * 0.055);
    const rightEnd = width - Math.max(22, width * 0.035);
    const rightW = Math.max(150, rightEnd - rightStart);
    const artTop = height * 0.22;
    const artBottom = height * 0.87;
    const artH = artBottom - artTop;

    // 4 Compiled Native Modules on the right:
    const gap = Math.max(10, Math.min(16, rightW * 0.032));
    const col1W = Math.round(rightW * 0.52);
    const col2W = rightW - col1W - gap;
    const row1H = Math.round(artH * 0.58);
    const row2H = artH - row1H - gap;

    const modA = { x: rightStart, y: artTop, w: col1W, h: row1H }; // Hero Editorial Frame
    const modB = { x: rightStart + col1W + gap, y: artTop, w: col2W, h: row1H }; // Polar Geometry Ring
    const modC = { x: rightStart, y: artTop + row1H + gap, w: Math.round(rightW * 0.62), h: row2H }; // Data Table Lattice
    const modD = {
      x: rightStart + Math.round(rightW * 0.62) + gap,
      y: artTop + row1H + gap,
      w: rightW - Math.round(rightW * 0.62) - gap,
      h: row2H,
    }; // Metric Vector Card

    const targetAnchors = [
      { x: modA.x, y: modA.y + modA.h * 0.34 },
      { x: modA.x, y: modA.y + modA.h * 0.72 },
      { x: modC.x, y: modC.y + modC.h * 0.5 },
      { x: modB.x, y: modB.y + modB.h * 0.5 },
    ];

    // -----------------------------------------------------------------------
    // A. LEFT FIELD: Continuous Perceptual Wave Ribbons -> Lens Aperture
    // -----------------------------------------------------------------------
    const leftSpan = lensX - lensHalfW;
    rays.forEach((ray) => {
      const baseY = height * 0.5 + ray.norm * (height * 0.31);
      const cursorPull = (pointer.y * height - baseY) * (0.28 * (1 - Math.abs(pointer.x - 0.28)));
      const entryY = baseY + cursorPull * 0.35;
      const apertureY = focalY + ray.norm * (lensH * 0.24);

      const strokeColor =
        ray.hueSlot === 0 ? palette.cyan : ray.hueSlot === 1 ? palette.indigo : palette.emerald;

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = stageMode === 'wireframe' ? 0.26 : 0.52;
      ctx.lineWidth = stageMode === 'wireframe' ? 1 : 1.35;
      ctx.beginPath();

      const segments = 38;
      for (let s = 0; s <= segments; s++) {
        const u = s / segments;
        const x = u * leftSpan;
        // Envelope damps chaotic wave amplitude smoothly as it approaches the lens
        const envelope = Math.sin(u * Math.PI) * (1 - u * 0.55);
        const harmonic =
          Math.sin(u * ray.freq * 5.2 - t * ray.speed * 2.1 + ray.phase) * ray.amp * envelope +
          Math.cos(u * 3.1 + t * 1.1 + ray.index) * (ray.amp * 0.35) * envelope;
        const y = entryY * (1 - u) + apertureY * u + harmonic;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Traveling incident photon packet
      if (!reducedMotion && stageMode !== 'wireframe') {
        const pu = ((t * ray.speed * 0.34 + ray.index * 0.13) % 1 + 1) % 1;
        const px = pu * leftSpan;
        const penvelope = Math.sin(pu * Math.PI) * (1 - pu * 0.55);
        const pharmonic =
          Math.sin(pu * ray.freq * 5.2 - t * ray.speed * 2.1 + ray.phase) * ray.amp * penvelope +
          Math.cos(pu * 3.1 + t * 1.1 + ray.index) * (ray.amp * 0.35) * penvelope;
        const py = entryY * (1 - pu) + apertureY * pu + pharmonic;

        ctx.globalAlpha = 0.92;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ---------------------------------------------------------------------
      // B. RIGHT FIELD: Deterministic Refracted Splines -> Native Anchors
      // ---------------------------------------------------------------------
      const anchor = targetAnchors[ray.targetSlot];
      const exitX = lensX + lensHalfW;
      const exitY = apertureY * 0.72 + focalY * 0.28;

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = stageMode === 'lattice' ? 0.55 : 0.34;
      ctx.lineWidth = 1.15;
      if (stageMode === 'lattice') {
        ctx.setLineDash([4, 4]);
      }
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      const cp1x = exitX + (anchor.x - exitX) * 0.46;
      const cp2x = exitX + (anchor.x - exitX) * 0.64;
      ctx.bezierCurveTo(cp1x, exitY, cp2x, anchor.y, anchor.x, anchor.y);
      ctx.stroke();
      ctx.restore();
    });

    // -----------------------------------------------------------------------
    // C. COMPILED NATIVE STRUCTURE ARTIFACT (RIGHT HALF)
    // -----------------------------------------------------------------------
    const showLattice = stageMode === 'lattice';
    const isWire = stageMode === 'wireframe';

    // Optional Constraint Lattice construction rails & dimension callouts
    if (showLattice) {
      ctx.save();
      ctx.strokeStyle = palette.rail;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      [modA.x, modA.x + modA.w, modB.x + modB.w].forEach((vx) => {
        ctx.moveTo(vx, artTop - 18);
        ctx.lineTo(vx, artBottom + 18);
      });
      [modA.y, modA.y + modA.h, modC.y + modC.h].forEach((hy) => {
        ctx.moveTo(rightStart - 16, hy);
        ctx.lineTo(rightEnd + 12, hy);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = palette.cyan;
      ctx.font = '500 9.5px "JetBrains Mono", monospace';
      ctx.fillText(`x:${Math.round(modA.x)} y:${Math.round(modA.y)}`, modA.x + 4, modA.y - 6);
      const bLabel = width < 540 ? `w:${Math.round(modB.w)}pt` : `w:${Math.round(modB.w)}pt · snap:0.00`;
      ctx.fillText(bLabel, modB.x + 4, modB.y - 6);
      ctx.restore();
    }

    // Helper to draw each compiled module frame
    const modules = [modA, modB, modC, modD];
    modules.forEach((m, idx) => {
      ctx.save();
      drawRoundedRect(m.x, m.y, m.w, m.h, 10);
      if (!isWire) {
        ctx.fillStyle = palette.cardFill;
        ctx.fill();
      }
      ctx.strokeStyle = idx === 0 ? palette.cyan : palette.cardStroke;
      ctx.lineWidth = idx === 0 ? 1.5 : 1.2;
      ctx.stroke();
      ctx.restore();
    });

    // Module A internal native primitives (Editorial Hierarchy + Vector Spline)
    ctx.save();
    const padA = 14;
    if (!isWire) {
      ctx.fillStyle = palette.cyan;
      ctx.globalAlpha = 0.78;
      drawRoundedRect(modA.x + padA, modA.y + padA, Math.min(54, modA.w * 0.36), 5, 2.5);
      ctx.fill();

      ctx.fillStyle = palette.ink;
      ctx.globalAlpha = 0.88;
      drawRoundedRect(modA.x + padA, modA.y + padA + 13, modA.w * 0.72, 9, 3);
      ctx.fill();

      ctx.globalAlpha = 0.42;
      drawRoundedRect(modA.x + padA, modA.y + padA + 28, modA.w * 0.54, 8, 3);
      ctx.fill();
    } else {
      ctx.strokeStyle = palette.cyan;
      ctx.lineWidth = 1.1;
      drawRoundedRect(modA.x + padA, modA.y + padA + 12, modA.w * 0.72, 10, 3);
      ctx.stroke();
      ctx.fillStyle = palette.cyan;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText('#frame-01', modA.x + padA, modA.y + padA + 7);
    }

    // Crisp parametric curve inside Mod A
    const curveY = modA.y + modA.h - 22;
    const cStartX = modA.x + padA;
    const cEndX = modA.x + modA.w - padA;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = palette.indigo;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cStartX, curveY);
    ctx.bezierCurveTo(
      cStartX + (cEndX - cStartX) * 0.35,
      curveY - 24,
      cStartX + (cEndX - cStartX) * 0.65,
      curveY + 12,
      cEndX,
      curveY - 14
    );
    ctx.stroke();

    if (isWire || showLattice) {
      // Tangent handle visualization
      const tx = cStartX + (cEndX - cStartX) * 0.35;
      const ty = curveY - 24;
      ctx.strokeStyle = palette.cyan;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cStartX, curveY);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.fillStyle = palette.cyan;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Module B internal native primitives (Precision Polar Ring)
    ctx.save();
    const cxB = modB.x + modB.w / 2;
    const cyB = modB.y + modB.h / 2;
    const rOuter = Math.max(16, Math.min(modB.w, modB.h) * 0.32);
    const rInner = rOuter * 0.58;

    ctx.strokeStyle = palette.inkFaint;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cxB, cyB, rOuter, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = palette.cyan;
    ctx.lineWidth = isWire ? 1.5 : 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const sweepAngle = -Math.PI * 0.45 + (pointer.y - 0.5) * 0.5;
    ctx.arc(cxB, cyB, rOuter, sweepAngle, sweepAngle + Math.PI * 1.35);
    ctx.stroke();

    ctx.strokeStyle = palette.indigo;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cxB, cyB, rInner, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = palette.cyan;
    ctx.beginPath();
    ctx.arc(cxB, cyB, 3, 0, Math.PI * 2);
    ctx.fill();
    if (isWire) {
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText('#polar-02', modB.x + 10, modB.y + 16);
    }
    ctx.restore();

    // Module C internal native primitives (Structured 3-Column Table Grid)
    ctx.save();
    ctx.strokeStyle = palette.inkFaint;
    ctx.lineWidth = 1;
    const c1 = modC.x + modC.w * 0.34;
    const c2 = modC.x + modC.w * 0.68;
    const midY = modC.y + modC.h * 0.48;
    ctx.beginPath();
    ctx.moveTo(c1, modC.y);
    ctx.lineTo(c1, modC.y + modC.h);
    ctx.moveTo(c2, modC.y);
    ctx.lineTo(c2, modC.y + modC.h);
    ctx.moveTo(modC.x, midY);
    ctx.lineTo(modC.x + modC.w, midY);
    ctx.stroke();

    ctx.fillStyle = palette.inkSoft;
    ctx.font = '500 9px "JetBrains Mono", monospace';
    if (modC.h > 44 && width > 560) {
      ctx.fillStyle = palette.cyan;
      ctx.fillText('AST_NODE', modC.x + 10, modC.y + 16);
      ctx.fillStyle = palette.inkSoft;
      ctx.fillText('SOLVER', c1 + 10, modC.y + 16);
      ctx.fillText('STATE', c2 + 10, modC.y + 16);

      ctx.fillStyle = palette.ink;
      ctx.fillText('Vector', modC.x + 10, midY + 17);
      ctx.fillText('Exact', c1 + 10, midY + 17);
      ctx.fillStyle = palette.emerald;
      ctx.fillText('NATIVE', c2 + 10, midY + 17);
    }
    ctx.restore();

    // Module D internal native primitives (Aligned Isometric/Bar Strata)
    ctx.save();
    const bars = 4;
    const barZoneW = modD.w - 24;
    const barGap = 6;
    const barW = Math.max(4, (barZoneW - barGap * (bars - 1)) / bars);
    const ratios = [0.46, 0.72, 0.6, 0.88];
    ratios.forEach((ratio, bi) => {
      const bx = modD.x + 12 + bi * (barW + barGap);
      const bh = (modD.h - 24) * ratio;
      const by = modD.y + modD.h - 12 - bh;
      drawRoundedRect(bx, by, barW, bh, 2.5);
      if (!isWire) {
        ctx.fillStyle = bi === 3 ? palette.cyan : palette.inkFaint;
        ctx.fill();
      } else {
        ctx.strokeStyle = bi === 3 ? palette.cyan : palette.cardStroke;
        ctx.stroke();
      }
    });
    ctx.restore();

    // Causal C1 connector between Module A and Module B
    ctx.save();
    const connY = modA.y + modA.h * 0.5;
    ctx.strokeStyle = palette.cyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(modA.x + modA.w, connY);
    ctx.lineTo(modB.x, connY);
    ctx.stroke();
    ctx.restore();

    // Vertex anchor handles on primary frame (and all frames in wireframe/lattice mode)
    const handleTargets = isWire || showLattice ? modules : [modA];
    handleTargets.forEach((m) => {
      drawVertexHandle(m.x, m.y, 6, palette.handleFill, palette.cyan);
      drawVertexHandle(m.x + m.w, m.y, 6, palette.handleFill, palette.cyan);
      drawVertexHandle(m.x, m.y + m.h, 6, palette.handleFill, palette.cyan);
      drawVertexHandle(m.x + m.w, m.y + m.h, 6, palette.handleFill, palette.cyan);
    });

    // -----------------------------------------------------------------------
    // D. CENTER OPTICAL LENS / REFRACTIVE KERNEL ASSEMBLY
    // -----------------------------------------------------------------------
    ctx.save();

    // Vertical optical axis line
    ctx.strokeStyle = palette.inkFaint;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(lensX, 0);
    ctx.lineTo(lensX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bi-convex crystalline lens silhouette
    const lensGrad = ctx.createLinearGradient(lensX - lensHalfW, lensTop, lensX + lensHalfW, lensBottom);
    lensGrad.addColorStop(0, palette.lensFillB);
    lensGrad.addColorStop(0.5, palette.lensFillA);
    lensGrad.addColorStop(1, palette.lensFillB);

    ctx.beginPath();
    ctx.moveTo(lensX, lensTop);
    ctx.quadraticCurveTo(lensX + lensHalfW * 1.65, height * 0.5, lensX, lensBottom);
    ctx.quadraticCurveTo(lensX - lensHalfW * 1.65, height * 0.5, lensX, lensTop);
    ctx.closePath();
    ctx.fillStyle = lensGrad;
    ctx.fill();
    ctx.strokeStyle = palette.lensStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Graduation ticks along optical axis
    ctx.strokeStyle = palette.lensStroke;
    ctx.lineWidth = 1;
    const tickCount = 9;
    for (let ti = 1; ti < tickCount; ti++) {
      const ty = lensTop + (lensH * ti) / tickCount;
      const halfTick = ti === Math.floor(tickCount / 2) ? 7 : 3.5;
      ctx.beginPath();
      ctx.moveTo(lensX - halfTick, ty);
      ctx.lineTo(lensX + halfTick, ty);
      ctx.stroke();
    }

    // Dynamic focal prism node tracking pointer refraction
    const glow = ctx.createRadialGradient(lensX, focalY, 1, lensX, focalY, 26);
    glow.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.36)' : 'rgba(56, 189, 248, 0.46)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lensX, focalY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Crisp diamond focal core
    ctx.fillStyle = palette.ink;
    ctx.strokeStyle = palette.cyan;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(lensX, focalY - 6);
    ctx.lineTo(lensX + 6, focalY);
    ctx.lineTo(lensX, focalY + 6);
    ctx.lineTo(lensX - 6, focalY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  requestAnimationFrame(render);
})();
