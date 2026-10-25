// Hero scene: the Codex-painted Hội An corner (assets/hero.png) with live effects on top.
// Lanterns glow at fixed light points, petals fall from the canopy's pink pixels, and the river below mirrors the whole scene with a ripple.
// At night (html[data-sky="night"]) the art dims under a starry sky with fireflies. Visitors can
// click lanterns and the tree, stir the river, and a "festival" event fires fireworks.

const ART = 'assets/hero.png';
const WATER_RATIO = 0.3;
// Extra ground added to the left of the art so the scene spreads under the hero text
// and fades out instead of ending in a hard edge.
const SPREAD = 0.6;
const PAVING_ROWS = 6;

const PETAL_COLORS = ['#fbcad7', '#f29bb3', '#e8789a', '#f7b3c6'];
const FIREWORK_COLORS = ['#ff5a4a', '#ffd166', '#f29bb3', '#fff4d6', '#7fd4a8'];
const MOON = [200, 10, 5];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Light sources in assets/hero.png pixel coordinates: [x, y, radius].
// Lanterns under the eaves, the two lamps inside the shop, and the shrine's incense.
const LIGHTS = [
  [195, 78, 14], [219, 77, 14], [232, 78, 13], [244, 80, 13],
  [212, 102, 10], [230, 110, 10], [125, 122, 8],
];

// Pink pixels in the canopy become petal spawn points.
function findBlossoms(img) {
  const { width: w, height: h } = img;
  const src = makeCanvas(w, h).getContext('2d', { willReadFrequently: true });
  src.drawImage(img, 0, 0);
  const { data } = src.getImageData(0, 0, w, h);
  const blossoms = [];
  for (let y = 0; y < h * 0.8; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a > 200 && r > 200 && b > 100 && g < 170 && r - g > 60) blossoms.push([x, y]);
    }
  }
  return blossoms;
}

// Continue the art's stone paving to the left and dress it with grass, pebbles and petals.
function buildBase(img, pad) {
  const w = img.width + pad;
  const h = img.height;
  const base = makeCanvas(w, h);
  const g = base.getContext('2d');
  const tileX = Math.round(img.width * 0.45);
  const tileW = 48;
  for (let x = pad - tileW; x > -tileW; x -= tileW) {
    g.drawImage(img, tileX, h - PAVING_ROWS, tileW, PAVING_ROWS, x, h - PAVING_ROWS, tileW, PAVING_ROWS);
  }
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const top = h - PAVING_ROWS;
  for (let i = 0; i < pad / 3; i++) {
    const x = Math.floor(rand() * pad);
    const kind = rand();
    if (kind < 0.45) {
      const tall = 2 + Math.floor(rand() * 3);
      g.fillStyle = ['#3f7a3a', '#5a9a3e', '#7cb24a'][Math.floor(rand() * 3)];
      g.fillRect(x, top - tall, 1, tall);
      g.fillRect(x + 1, top - tall + 1, 1, tall - 1);
    } else if (kind < 0.8) {
      g.fillStyle = ['#f29bb3', '#fbcad7', '#e8789a'][Math.floor(rand() * 3)];
      g.fillRect(x, top - 1, 2, 1);
    } else {
      g.fillStyle = '#9a948a';
      g.fillRect(x, top - 2, 3, 2);
      g.fillStyle = '#6f6a62';
      g.fillRect(x, top - 1, 3, 1);
    }
  }
  g.drawImage(img, pad, 0);
  return base;
}

function makeGlow(w, h, offset) {
  const glow = makeCanvas(w, h);
  const gg = glow.getContext('2d');
  for (const [lx, y, r] of LIGHTS) {
    const x = lx + offset;
    const grad = gg.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,190,90,0.55)');
    grad.addColorStop(1, 'rgba(255,190,90,0)');
    gg.fillStyle = grad;
    gg.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return glow;
}

// Night version of the scene: the art multiplied toward blue, keeping its own transparency.
function makeNight(base) {
  const night = makeCanvas(base.width, base.height);
  const ng = night.getContext('2d');
  ng.drawImage(base, 0, 0);
  ng.globalCompositeOperation = 'multiply';
  ng.fillStyle = '#5a64a6';
  ng.fillRect(0, 0, base.width, base.height);
  ng.globalCompositeOperation = 'destination-in';
  ng.drawImage(base, 0, 0);
  return night;
}

// Night sky behind the art: a soft indigo halo with stars and a crescent moon.
function makeSky(w, h, pad, artW) {
  const cx = pad + artW / 2;
  const sky = makeCanvas(w, h);
  const sg = sky.getContext('2d');
  const halo = sg.createRadialGradient(cx, h * 0.45, 10, cx, h * 0.45, h * 1.1);
  halo.addColorStop(0, 'rgba(36,44,92,0.95)');
  halo.addColorStop(0.6, 'rgba(44,52,104,0.75)');
  halo.addColorStop(1, 'rgba(44,52,104,0)');
  sg.fillStyle = halo;
  sg.fillRect(0, 0, w, h);
  // Fade the top edge so the sky has no hard line where the canvas starts.
  const fade = sg.createLinearGradient(0, 0, 0, h * 0.35);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,1)');
  sg.globalCompositeOperation = 'destination-in';
  sg.fillStyle = fade;
  sg.fillRect(0, 0, w, h);
  sg.globalCompositeOperation = 'source-over';
  const [mx, my, r] = MOON;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const bite = (x - 2) ** 2 + (y + 1) ** 2 <= (r - 1) ** 2;
      if (bite) continue;
      sg.fillStyle = x + y < -2 ? '#fff6d8' : '#f2dc8c';
      sg.fillRect(pad + mx + x, my + y, 1, 1);
    }
  }
  return sky;
}

export async function mountScene(canvas, { reducedMotion = false } = {}) {
  const img = await loadImage(ART);
  const PAD = Math.round(img.width * SPREAD);
  const W = img.width + PAD;
  const GROUND = img.height;
  const H = GROUND + Math.round(GROUND * WATER_RATIO);
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const frame = makeCanvas(W, GROUND);
  const fg = frame.getContext('2d');
  const blossoms = findBlossoms(img).map(([x, y]) => [x + PAD, y]);
  const glow = makeGlow(W, GROUND, PAD);
  const base = buildBase(img, PAD);
  const night = makeNight(base);
  const sky = makeSky(W, GROUND, PAD, img.width);
  const root = document.documentElement;
  let nightMix = root.dataset.sky === 'night' ? 1 : 0;

  let seed = 5;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const stars = Array.from({ length: 70 }, () => [Math.floor(rand() * W), Math.floor(rand() * GROUND * 0.55), rand() * 6.28]);
  const fireflies = Array.from({ length: 12 }, () => ({ x: PAD + rand() * img.width * 0.7, y: GROUND * (0.35 + rand() * 0.5), phase: rand() * 6.28 }));
  const burst = [];
  const flares = [];
  const ripples = [];
  const rockets = [];
  const sparks = [];
  let festivalUntil = 0;

  // The river fades into the page background, so follow the theme's --paper colour.
  const readPaper = () => {
    const hex = getComputedStyle(root).getPropertyValue('--paper').trim().slice(1);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
  };
  let paper = readPaper();
  new MutationObserver(() => (paper = readPaper())).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  const spawn = (p = {}) => {
    const [x, y] = blossoms.length ? blossoms[Math.floor(Math.random() * blossoms.length)] : [W * 0.3, GROUND * 0.3];
    return Object.assign(p, {
      x,
      y,
      vy: 8 + Math.random() * 10,
      phase: Math.random() * 6.28,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    });
  };
  const petals = Array.from({ length: 34 }, () => spawn());
  petals.forEach((p) => (p.y += Math.random() * GROUND * 0.5));
  const floaters = Array.from({ length: 4 }, (_, i) => ({
    x: (i / 4) * W + Math.random() * 40,
    row: GROUND + 10 + i * Math.round((H - GROUND - 18) / 4),
    speed: 3 + Math.random() * 3,
  }));

  let last = performance.now();
  let raf = 0;
  let visible = true;

  function render(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    const wantNight = root.dataset.sky === 'night' || now < festivalUntil ? 1 : 0;
    nightMix += Math.sign(wantNight - nightMix) * Math.min(Math.abs(wantNight - nightMix), dt * 1.2);

    fg.clearRect(0, 0, W, GROUND);
    if (nightMix > 0) {
      fg.globalAlpha = nightMix;
      fg.drawImage(sky, 0, 0);
      for (const [x, y, ph] of stars) {
        fg.globalAlpha = nightMix * (0.35 + 0.65 * Math.max(0, Math.sin(t * 1.7 + ph)));
        fg.fillStyle = '#fff6d8';
        fg.fillRect(x, y, 1, 1);
      }
      fg.globalAlpha = 1;
    }
    fg.drawImage(base, 0, 0);
    if (nightMix > 0) {
      fg.globalAlpha = nightMix;
      fg.drawImage(night, 0, 0);
    }
    fg.globalCompositeOperation = 'lighter';
    fg.globalAlpha = (0.75 + Math.sin(t * 2.2) * 0.15 + Math.sin(t * 7.3) * 0.05) * (1 + nightMix * 0.6);
    fg.drawImage(glow, 0, 0);
    for (let i = flares.length - 1; i >= 0; i--) {
      const f = flares[i];
      const life = 1 - (now - f.start) / 1400;
      if (life <= 0) {
        flares.splice(i, 1);
        continue;
      }
      const grad = fg.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.2);
      grad.addColorStop(0, `rgba(255,200,110,${0.9 * life})`);
      grad.addColorStop(1, 'rgba(255,200,110,0)');
      fg.globalAlpha = 1;
      fg.fillStyle = grad;
      fg.fillRect(f.x - f.r * 2.2, f.y - f.r * 2.2, f.r * 4.4, f.r * 4.4);
    }
    drawFireworks(dt);
    fg.globalAlpha = 1;
    fg.globalCompositeOperation = 'source-over';

    if (nightMix > 0) {
      for (const f of fireflies) {
        const x = Math.round(f.x + Math.sin(t * 0.6 + f.phase) * 10);
        const y = Math.round(f.y + Math.sin(t * 0.9 + f.phase * 2) * 5);
        fg.globalAlpha = nightMix * Math.max(0, Math.sin(t * 2.4 + f.phase));
        fg.fillStyle = '#e8ff8a';
        fg.fillRect(x, y, 1, 1);
      }
      fg.globalAlpha = 1;
    }

    for (let i = burst.length - 1; i >= 0; i--) {
      const p = burst[i];
      p.vy += 30 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      if (p.y > GROUND + 2) {
        burst.splice(i, 1);
        continue;
      }
      fg.fillStyle = p.color;
      const w = Math.sin(t * 6 + p.phase) > 0 ? 2 : 1;
      fg.fillRect(Math.round(p.x), Math.round(p.y), w, 3 - w);
    }

    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += (Math.sin(t * 1.4 + p.phase) * 8 + 5) * dt;
      if (p.y > GROUND + 2 || p.x > W) spawn(p);
      fg.fillStyle = p.color;
      const w = Math.sin(t * 3 + p.phase) > 0 ? 2 : 1;
      fg.fillRect(Math.round(p.x), Math.round(p.y), w, 3 - w);
    }

    g.clearRect(0, 0, W, H);
    g.drawImage(frame, 0, 0);

    // River: mirrored rows with a ripple that grows with depth, then a tint fading into the page.
    const depth = H - GROUND;
    for (let i = 0; i < depth; i++) {
      const off = Math.round(Math.sin(t * 1.8 + i * 0.45) * (1 + (i / depth) * 2.5));
      g.drawImage(frame, 0, GROUND - 1 - i * 1.25, W, 1, off, GROUND + i, W, 1);
    }
    const tint = g.createLinearGradient(0, GROUND, 0, H);
    tint.addColorStop(0, 'rgba(120,150,170,0.38)');
    tint.addColorStop(0.55, `rgba(${paper},0.7)`);
    tint.addColorStop(1, `rgba(${paper},1)`);
    g.fillStyle = tint;
    g.fillRect(0, GROUND, W, depth);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0; k < 10; k++) {
      const x = (k * 97 + Math.floor(t * 9)) % W;
      if (Math.sin(t * 2.6 + k) > 0.3) g.fillRect(x, GROUND + 3 + ((k * 11) % (depth - 8)), 5, 1);
    }

    // Rings where the pointer stirred the river.
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const age = (now - rp.start) / 1000;
      if (age > 1.6) {
        ripples.splice(i, 1);
        continue;
      }
      const rx = 2 + age * 14;
      g.fillStyle = `rgba(255,255,255,${0.75 * (1 - age / 1.6)})`;
      for (let a = 0; a < 6.28; a += 0.35) {
        g.fillRect(Math.round(rp.x + Math.cos(a) * rx), Math.round(rp.y + Math.sin(a) * rx * 0.3), 1, 1);
      }
    }

    // Floating lotus lanterns (đèn hoa đăng).
    for (const f of floaters) {
      f.x = (f.x + f.speed * dt) % (W + 12);
      const x = Math.round(f.x) - 6;
      const bob = Math.round(Math.sin(t * 2 + f.row) * 0.6);
      const halo = g.createRadialGradient(x + 3, f.row - 2, 0, x + 3, f.row - 2, 8);
      halo.addColorStop(0, 'rgba(255,200,110,0.5)');
      halo.addColorStop(1, 'rgba(255,200,110,0)');
      g.fillStyle = halo;
      g.fillRect(x - 5, f.row - 10, 16, 16);
      const px = (dx, dy, c) => {
        g.fillStyle = c;
        g.fillRect(x + dx, f.row + dy + bob, 1, 1);
      };
      for (let dx = 0; dx < 7; dx++) px(dx, 0, '#3e7d4a');
      for (let dx = 1; dx < 6; dx++) px(dx, -1, '#e8789a');
      px(2, -2, '#fbcad7');
      px(4, -2, '#fbcad7');
      px(3, -3, Math.sin(t * 12 + f.row) > 0 ? '#ffe08a' : '#f2b632');
    }

    if (!reducedMotion && visible) raf = requestAnimationFrame(render);
  }

  // Rockets rise from the river and burst into sparks over the scene (drawn additively).
  function drawFireworks(dt) {
    const now = performance.now();
    if (now < festivalUntil && Math.random() < dt * 4.5) {
      rockets.push({ x: PAD * 0.6 + Math.random() * (W - PAD * 0.6 - 10), y: GROUND, top: 10 + Math.random() * 45, color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)] });
    }
    fg.fillStyle = '#fff4d6';
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y -= 90 * dt;
      fg.fillRect(Math.round(r.x), Math.round(r.y), 1, 2);
      if (r.y > r.top) continue;
      rockets.splice(i, 1);
      flares.push({ x: r.x, y: r.y, r: 14, start: now });
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * 6.28 * 3;
        const speed = [20, 34, 46][k % 3] + Math.random() * 6;
        sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, color: r.color });
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life -= dt * 0.65;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      p.vy += 22 * dt;
      p.vx *= 0.97;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      fg.globalAlpha = Math.min(1, p.life * 1.5);
      fg.fillStyle = p.life < 0.3 && Math.random() < 0.5 ? '#fff4d6' : p.color;
      fg.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      fg.globalAlpha *= 0.4;
      fg.fillRect(Math.round(p.x - p.vx * 0.04), Math.round(p.y - p.vy * 0.04), 1, 1);
    }
    fg.globalAlpha = 1;
  }

  addEventListener('festival', () => {
    festivalUntil = performance.now() + 9000;
  });
  // Without the animation loop, redraw a still frame whenever day and night switch.
  if (reducedMotion) {
    new MutationObserver(() => {
      nightMix = root.dataset.sky === 'night' ? 1 : 0;
      render(performance.now());
    }).observe(root, { attributes: true, attributeFilter: ['data-sky', 'data-theme'] });
  }

  // Pointer interaction, in scene pixels.
  const toScene = (e) => {
    const rect = canvas.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H];
  };
  const lights = LIGHTS.map(([x, y, r]) => ({ x: x + PAD, y, r }));
  const lanternAt = (x, y) => lights.find((l) => Math.hypot(l.x - x, l.y - y) < Math.max(5, l.r * 0.5));
  const blossomsNear = (x, y, r) => blossoms.filter(([bx, by]) => Math.abs(bx - x) < r && Math.abs(by - y) < r);
  let lastRipple = 0;

  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = toScene(e);
    canvas.classList.toggle('is-hot', y < GROUND && Boolean(lanternAt(x, y) || blossomsNear(x, y, 3).length));
    const now = performance.now();
    if (y > GROUND + 2 && now - lastRipple > 140 && ripples.length < 14) {
      lastRipple = now;
      ripples.push({ x, y, start: now });
    }
  });
  canvas.addEventListener('click', (e) => {
    const [x, y] = toScene(e);
    const now = performance.now();
    const lantern = lanternAt(x, y);
    if (lantern) {
      flares.push({ ...lantern, start: now });
      return;
    }
    const near = blossomsNear(x, y, 12);
    if (near.length) {
      for (let k = 0; k < 18; k++) {
        const [bx, by] = near[Math.floor(Math.random() * near.length)];
        burst.push({ x: bx, y: by, vx: (Math.random() - 0.5) * 50, vy: -10 - Math.random() * 20, phase: Math.random() * 6.28, color: PETAL_COLORS[k % PETAL_COLORS.length] });
      }
    } else if (y > GROUND) {
      ripples.push({ x, y, start: now }, { x, y, start: now - 400 });
    }
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion) {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(render);
    }
  }).observe(canvas);
  render(performance.now());
}
