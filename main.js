/* ==========================================================================
   LYU.ai — Living Horizon Canvas, Theme Controller & Tactile Interactions
   ========================================================================== */

/* 1. Theme Controller (Dark Nocturne & Light Porcelain) */
let currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

function applyTheme(theme, persist = true) {
  currentTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const meta = document.getElementById('meta-theme-color');
  if (meta) {
    meta.setAttribute('content', currentTheme === 'light' ? '#f7f6f2' : '#07080d');
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

/* 2. Copy Email Micro-Interaction */
document.querySelectorAll('.copy-email-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email') || 'hi@lyu.ai';
    const badge = btn.querySelector('.copy-badge');
    try {
      await navigator.clipboard.writeText(email);
      if (badge) {
        badge.textContent = 'Copied';
        badge.style.color = 'var(--accent-amber)';
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

/* 3. Pointer-Tracked Specular Cards & Scroll Reveal */
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
  { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* 4. Hero Atmospheric "Living Horizon" 60fps Simulation */
(function initLivingHorizon() {
  const canvas = document.getElementById('horizon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let visible = true;

  const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };

  // Three harmonic ribbon families (Robotics · Healthcare · Productivity)
  const ribbons = [
    { amp: 28, freq: 1.5, speed: 0.34, phase: 0.2, yOffset: -0.06, kind: 'amber' },
    { amp: 36, freq: 1.15, speed: 0.26, phase: 2.1, yOffset: 0.01, kind: 'cyan' },
    { amp: 24, freq: 1.85, speed: 0.3, phase: 4.0, yOffset: 0.07, kind: 'indigo' },
  ];

  // Gentle ascending luminous motes
  const MOTES = 26;
  const motes = Array.from({ length: MOTES }, (_, i) => ({
    x: ((i * 37) % 100) / 100,
    y: ((i * 61) % 100) / 100,
    r: 1 + (i % 3) * 0.75,
    speed: 0.012 + (i % 5) * 0.004,
    drift: (i % 2 === 0 ? 1 : -1) * (0.008 + (i % 4) * 0.003),
    phase: i * 0.9,
  }));

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(360, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  const vo = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.01 }
  );
  vo.observe(canvas);

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.tx = e.clientX / Math.max(1, window.innerWidth);
      pointer.ty = e.clientY / Math.max(1, window.innerHeight);
    },
    { passive: true }
  );

  const start = performance.now();

  function render(now) {
    requestAnimationFrame(render);
    if (!visible && !reducedMotion) return;

    const t = reducedMotion ? 2.4 : (now - start) * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    const isLight = currentTheme === 'light';
    ctx.clearRect(0, 0, width, height);

    const sunX = width * (0.5 + (pointer.x - 0.5) * 0.16);
    const sunY = height * (0.78 + (pointer.y - 0.5) * 0.06);

    // 1. Atmospheric Dawn / Celestial Aura
    const auraRadius = Math.max(width * 0.62, 520);
    const aura = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, auraRadius);
    if (isLight) {
      aura.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      aura.addColorStop(0.32, 'rgba(56, 189, 248, 0.15)');
      aura.addColorStop(0.65, 'rgba(129, 140, 248, 0.09)');
      aura.addColorStop(1, 'rgba(247, 246, 242, 0)');
    } else {
      aura.addColorStop(0, 'rgba(251, 191, 36, 0.20)');
      aura.addColorStop(0.3, 'rgba(56, 189, 248, 0.15)');
      aura.addColorStop(0.62, 'rgba(129, 140, 248, 0.10)');
      aura.addColorStop(1, 'rgba(7, 8, 13, 0)');
    }
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    // 2. Three Gossamer Harmonic Light Ribbons
    ribbons.forEach((rib) => {
      const strands = 5;
      for (let s = 0; s < strands; s++) {
        const strandNorm = s / (strands - 1);
        ctx.save();
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        if (rib.kind === 'amber') {
          const alpha = isLight ? 0.22 - strandNorm * 0.03 : 0.24 - strandNorm * 0.035;
          grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
          grad.addColorStop(0.35, `rgba(251, 191, 36, ${alpha})`);
          grad.addColorStop(0.68, `rgba(251, 113, 133, ${alpha * 0.85})`);
          grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
        } else if (rib.kind === 'cyan') {
          const alpha = isLight ? 0.2 - strandNorm * 0.03 : 0.25 - strandNorm * 0.035;
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(0.3, `rgba(56, 189, 248, ${alpha})`);
          grad.addColorStop(0.7, `rgba(186, 230, 253, ${alpha * 0.9})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        } else {
          const alpha = isLight ? 0.18 - strandNorm * 0.025 : 0.23 - strandNorm * 0.03;
          grad.addColorStop(0, 'rgba(129, 140, 248, 0)');
          grad.addColorStop(0.38, `rgba(129, 140, 248, ${alpha})`);
          grad.addColorStop(0.72, `rgba(196, 181, 253, ${alpha * 0.85})`);
          grad.addColorStop(1, 'rgba(129, 140, 248, 0)');
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = s === 0 ? 1.5 : 1;
        ctx.beginPath();

        const steps = 64;
        const baseY = height * (0.64 + rib.yOffset) + (pointer.y - 0.5) * 22;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = u * width;
          // Gentle arch peaking near center + slow breathing sine
          const arch = -Math.sin(u * Math.PI) * (height * 0.13);
          const wave =
            Math.sin(u * Math.PI * 2 * rib.freq - t * rib.speed + rib.phase + s * 0.18) *
              (rib.amp + s * 4.5) +
            Math.cos(u * Math.PI * 1.3 + t * rib.speed * 0.7 + s * 0.25) * 10;
          const y = baseY + arch + wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    });

    // 3. Curved Planetary Horizon Arc
    const arcRadius = Math.max(width * 1.18, 1080);
    const arcCenterX = width * 0.5 + (pointer.x - 0.5) * -36;
    const arcCenterY = height * 0.82 + arcRadius;

    ctx.save();
    const rimGrad = ctx.createLinearGradient(width * 0.1, 0, width * 0.9, 0);
    if (isLight) {
      rimGrad.addColorStop(0, 'rgba(17, 19, 26, 0)');
      rimGrad.addColorStop(0.3, 'rgba(2, 132, 199, 0.26)');
      rimGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.42)');
      rimGrad.addColorStop(0.7, 'rgba(79, 70, 229, 0.26)');
      rimGrad.addColorStop(1, 'rgba(17, 19, 26, 0)');
    } else {
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimGrad.addColorStop(0.28, 'rgba(56, 189, 248, 0.38)');
      rimGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.72)');
      rimGrad.addColorStop(0.72, 'rgba(129, 140, 248, 0.38)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }

    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, arcRadius, -Math.PI * 0.72, -Math.PI * 0.28);
    ctx.stroke();
    ctx.restore();

    // 4. Ascending Luminous Motes
    if (!reducedMotion) {
      motes.forEach((m) => {
        const my = ((m.y - t * m.speed) % 1 + 1) % 1;
        const mx = ((m.x + Math.sin(t * 0.5 + m.phase) * m.drift) % 1 + 1) % 1;
        const fade = Math.sin(my * Math.PI);
        ctx.fillStyle = isLight
          ? `rgba(180, 83, 9, ${0.18 * fade})`
          : `rgba(254, 243, 199, ${0.32 * fade})`;
        ctx.beginPath();
        ctx.arc(mx * width, my * height * 0.88, m.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  requestAnimationFrame(render);
})();
