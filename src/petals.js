// Peach blossom petals (hoa đào) drifting across the whole page.
// Drawn on a low-res canvas so each petal stays a crisp pixel sprite when scaled up.

const PIXEL = 3;
const COLORS = [
  ['#f7b3c6', '#e8789a'],
  ['#fbcad7', '#f29bb3'],
  ['#f29bb3', '#d9607f'],
];

// Petal sprites as rows of pixels: 1 = light, 2 = shade. Alternating frames fake a tumble.
const SPRITES = [
  [[0, 1, 1], [1, 1, 2], [0, 2, 0]],
  [[1, 1], [1, 2]],
  [[0, 1, 0], [1, 1, 1], [0, 2, 0]],
  [[1, 1, 1], [0, 2, 2]],
];

export function mountPetals(canvas) {
  const g = canvas.getContext('2d');
  let petals = [];

  function spawn(y = -4) {
    return {
      x: Math.random() * canvas.width,
      y,
      vy: 5 + Math.random() * 6,
      sway: 4 + Math.random() * 6,
      phase: Math.random() * 6.28,
      spin: 1.5 + Math.random() * 2.5,
      sprite: Math.floor(Math.random() * SPRITES.length),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function resize() {
    canvas.width = Math.ceil(innerWidth / PIXEL);
    canvas.height = Math.ceil(innerHeight / PIXEL);
    const count = Math.round(canvas.width / 16);
    petals = Array.from({ length: count }, () => spawn(Math.random() * canvas.height));
  }

  function draw(p, now) {
    const flip = Math.sin(now / 1000 * p.spin + p.phase) > 0;
    const sprite = SPRITES[(p.sprite + (flip ? 1 : 0)) % SPRITES.length];
    const x0 = Math.round(p.x);
    const y0 = Math.round(p.y);
    sprite.forEach((row, y) =>
      row.forEach((v, x) => {
        if (!v) return;
        g.fillStyle = p.color[v - 1];
        g.fillRect(x0 + x, y0 + y, 1, 1);
      }),
    );
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.globalAlpha = 0.8;
    petals = petals.map((p) => {
      p.y += p.vy * dt;
      p.x += (Math.sin(now / 1100 + p.phase) * p.sway + 3) * dt;
      if (p.y > canvas.height + 4 || p.x > canvas.width + 4) return spawn();
      draw(p, now);
      return p;
    });
    g.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
}
