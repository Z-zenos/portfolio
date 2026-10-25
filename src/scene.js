// Hero scene: the Codex-painted Hội An corner (assets/hero.png) with live effects on top.
// Lanterns glow at fixed light points, petals fall from the canopy's pink pixels, and the river below mirrors the whole scene with a ripple.

const ART = 'assets/hero.png';
const WATER_RATIO = 0.3;

const PETAL_COLORS = ['#fbcad7', '#f29bb3', '#e8789a', '#f7b3c6'];

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

function makeGlow(w, h) {
  const glow = makeCanvas(w, h);
  const gg = glow.getContext('2d');
  for (const [x, y, r] of LIGHTS) {
    const grad = gg.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,190,90,0.55)');
    grad.addColorStop(1, 'rgba(255,190,90,0)');
    gg.fillStyle = grad;
    gg.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return glow;
}

export async function mountScene(canvas, { reducedMotion = false } = {}) {
  const img = await loadImage(ART);
  const W = img.width;
  const GROUND = img.height;
  const H = GROUND + Math.round(GROUND * WATER_RATIO);
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const frame = makeCanvas(W, GROUND);
  const fg = frame.getContext('2d');
  const blossoms = findBlossoms(img);
  const glow = makeGlow(W, GROUND);

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

    fg.clearRect(0, 0, W, GROUND);
    fg.drawImage(img, 0, 0);
    fg.globalCompositeOperation = 'lighter';
    fg.globalAlpha = 0.75 + Math.sin(t * 2.2) * 0.15 + Math.sin(t * 7.3) * 0.05;
    fg.drawImage(glow, 0, 0);
    fg.globalAlpha = 1;
    fg.globalCompositeOperation = 'source-over';

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
    tint.addColorStop(0.55, 'rgba(235,236,230,0.7)');
    tint.addColorStop(1, 'rgba(251,248,240,1)');
    g.fillStyle = tint;
    g.fillRect(0, GROUND, W, depth);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0; k < 10; k++) {
      const x = (k * 97 + Math.floor(t * 9)) % W;
      if (Math.sin(t * 2.6 + k) > 0.3) g.fillRect(x, GROUND + 3 + ((k * 11) % (depth - 8)), 5, 1);
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
