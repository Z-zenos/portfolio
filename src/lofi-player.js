// Generative lo-fi built with WebAudio: soft keys, a đàn bầu-style lead that slides
// into each note, dusty drums and vinyl crackle. Nothing is streamed or downloaded.

const TRACKS = [
  {
    title: 'Hoi An Dusk',
    titleJa: '会安の夕暮れ',
    bpm: 72,
    key: 57,
    chords: [[0, 3, 7, 10], [-4, 0, 3, 7], [3, 7, 10, 14], [-2, 2, 5, 7]],
    scale: [0, 3, 5, 7, 10, 12, 15],
    rain: false,
    seed: 7,
  },
  {
    title: 'Saigon Rain',
    titleJa: 'サイゴンの雨',
    bpm: 66,
    key: 55,
    chords: [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 5]],
    scale: [0, 2, 5, 7, 9, 12, 14],
    rain: true,
    seed: 21,
  },
  {
    title: 'Old Quarter 3AM',
    titleJa: '旧市街・午前三時',
    bpm: 78,
    key: 53,
    chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]],
    scale: [0, 3, 5, 7, 10, 12, 15],
    rain: false,
    seed: 99,
  },
];

const VOLUMES = { low: 0.25, med: 0.5, high: 0.8 };

const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function noiseBuffer(ctx, seconds, crackle = false) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = crackle ? (Math.random() < 0.0008 ? (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 0.04) : Math.random() * 2 - 1;
  }
  return buf;
}

class LofiEngine {
  constructor() {
    this.ctx = null;
    this.trackIndex = 0;
    this.volume = 'med';
    this.playing = false;
  }

  init() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = VOLUMES[this.volume];
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4200;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.75;
    this.levels = new Uint8Array(this.analyser.frequencyBinCount);
    this.master.connect(tone).connect(this.analyser).connect(ctx.destination);
    this.bus = ctx.createGain();
    this.bus.connect(this.master);
    this.noise = noiseBuffer(ctx, 1);

    const vinyl = ctx.createBufferSource();
    vinyl.buffer = noiseBuffer(ctx, 4, true);
    vinyl.loop = true;
    this.vinylGain = ctx.createGain();
    this.vinylGain.gain.value = 0.5;
    vinyl.connect(this.vinylGain).connect(this.master);
    vinyl.start();

    const rain = ctx.createBufferSource();
    rain.buffer = noiseBuffer(ctx, 3);
    rain.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1400;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    rain.connect(rainFilter).connect(this.rainGain).connect(this.master);
    rain.start();
  }

  get track() {
    return TRACKS[this.trackIndex];
  }

  start() {
    if (!this.ctx) this.init();
    this.ctx.resume();
    this.playing = true;
    this.loadTrack();
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.ctx?.suspend();
  }

  skip(direction) {
    this.trackIndex = (this.trackIndex + direction + TRACKS.length) % TRACKS.length;
    if (this.playing) this.loadTrack();
  }

  // Frequency bins (0-255) for the visualizer, or null before audio starts.
  getLevels() {
    if (!this.analyser || !this.playing) return null;
    this.analyser.getByteFrequencyData(this.levels);
    return this.levels;
  }

  setVolume(level) {
    this.volume = level;
    if (this.master) this.master.gain.setTargetAtTime(VOLUMES[level], this.ctx.currentTime, 0.05);
  }

  loadTrack() {
    const t = this.track;
    this.rand = rng(t.seed);
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.melodyIndex = 2;
    this.rainGain.gain.setTargetAtTime(t.rain ? 0.12 : 0, this.ctx.currentTime, 0.5);
  }

  schedule() {
    const t = this.track;
    const sixteenth = 60 / t.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      const s = this.step % 16;
      const bar = Math.floor(this.step / 16) % t.chords.length;
      const chord = t.chords[bar];
      const swing = s % 2 ? sixteenth * 0.28 : 0;
      const at = this.nextTime + swing;

      if (s === 0) {
        chord.forEach((n, i) => this.keys(at + i * 0.012, t.key + n, sixteenth * 15));
        this.bass(at, t.key + chord[0] - 24, sixteenth * 7);
      }
      if (s === 8) this.bass(at, t.key + chord[0] - 24, sixteenth * 6);
      if (s === 0 || s === 10 || (s === 7 && this.rand() < 0.4)) this.kick(at);
      if (s === 4 || s === 12) this.snare(at);
      if (s % 2 === 0 && this.rand() < 0.85) this.hat(at, s % 4 === 2 ? 0.06 : 0.035);

      if (s % 2 === 0 && this.rand() < 0.42) {
        const move = Math.floor(this.rand() * 3) - 1;
        this.melodyIndex = Math.max(0, Math.min(t.scale.length - 1, this.melodyIndex + move));
        const len = sixteenth * (this.rand() < 0.4 ? 6 : 3);
        this.lead(at, t.key + 12 + t.scale[this.melodyIndex], len);
      }

      this.nextTime += sixteenth;
      this.step++;
    }
  }

  keys(at, midi, dur) {
    const { ctx } = this;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.07, at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.02, at + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, at + dur);
    filter.connect(gain).connect(this.bus);
    for (const [type, mult, level] of [['triangle', 1, 1], ['sine', 2, 0.3]]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = midiHz(midi) * mult;
      osc.detune.value = (Math.random() - 0.5) * 12;
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start(at);
      osc.stop(at + dur + 0.05);
    }
  }

  lead(at, midi, dur) {
    const { ctx } = this;
    const f = midiHz(midi);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f * 0.94, at);
    osc.frequency.exponentialRampToValueAtTime(f, at + 0.12);
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.setValueAtTime(0, at);
    depth.gain.linearRampToValueAtTime(f * 0.012, at + dur);
    lfo.connect(depth).connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.09, at + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur + 0.3);
    osc.connect(gain).connect(this.bus);
    for (const node of [osc, lfo]) {
      node.start(at);
      node.stop(at + dur + 0.35);
    }
  }

  bass(at, midi, dur) {
    const { ctx } = this;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = midiHz(midi);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.22, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(gain).connect(this.bus);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  kick(at) {
    const { ctx } = this;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(120, at);
    osc.frequency.exponentialRampToValueAtTime(42, at + 0.12);
    gain.gain.setValueAtTime(0.55, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
    osc.connect(gain).connect(this.bus);
    osc.start(at);
    osc.stop(at + 0.32);
  }

  noiseHit(at, type, freq, level, decay) {
    const { ctx } = this;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + decay);
    src.connect(filter).connect(gain).connect(this.bus);
    src.start(at);
    src.stop(at + decay + 0.02);
  }

  snare(at) {
    this.noiseHit(at, 'bandpass', 1800, 0.18, 0.16);
  }

  hat(at, level) {
    this.noiseHit(at, 'highpass', 7000, level, 0.04);
  }
}

export function mountPlayer(root) {
  const engine = new LofiEngine();
  const q = (sel) => root.querySelector(sel);
  const status = q('[data-status]');
  const title = q('[data-title]');
  const titleJa = q('[data-title-ja]');
  const play = q('[data-play]');
  const dots = q('[data-dots]');
  const viz = q('[data-viz]');
  const volumeButtons = root.querySelectorAll('[data-volume]');
  const vg = viz.getContext('2d');
  const BARS = 14;
  let raf = 0;

  dots.innerHTML = TRACKS.map(() => '<i></i>').join('');

  function render() {
    root.classList.toggle('is-playing', engine.playing);
    status.textContent = engine.playing ? 'LIVE' : 'PAUSED';
    title.textContent = engine.track.title;
    titleJa.textContent = engine.track.titleJa;
    play.innerHTML = engine.playing ? '<span class="pi pi--pause"></span>PAUSE' : '<span class="pi pi--play"></span>PLAY';
    play.setAttribute('aria-pressed', String(engine.playing));
    [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === engine.trackIndex));
    volumeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.volume === engine.volume)));
    q('.vol').dataset.level = engine.volume;
  }

  // Pixel bar visualizer fed by the real audio; idles as a low flat line when paused.
  function drawViz() {
    const levels = engine.getLevels();
    const { width: w, height: h } = viz;
    vg.clearRect(0, 0, w, h);
    const bw = Math.floor(w / BARS);
    for (let i = 0; i < BARS; i++) {
      const v = levels ? Math.min(1, (levels[1 + i] / 255) * 1.35) : 0;
      const bh = Math.max(1, Math.round(v * h));
      for (let y = 0; y < bh; y++) {
        vg.fillStyle = y > h * 0.7 ? '#e0362c' : y > h * 0.4 ? '#f0a531' : '#3e8e41';
        vg.fillRect(i * bw, h - 1 - y, bw - 1, 1);
      }
    }
    raf = engine.playing ? requestAnimationFrame(drawViz) : 0;
  }

  play.addEventListener('click', () => {
    if (engine.playing) engine.stop();
    else engine.start();
    render();
    if (engine.playing && !raf) drawViz();
  });
  root.querySelectorAll('[data-skip]').forEach((b) =>
    b.addEventListener('click', () => {
      engine.skip(Number(b.dataset.skip));
      render();
    }),
  );
  volumeButtons.forEach((b) =>
    b.addEventListener('click', () => {
      engine.setVolume(b.dataset.volume);
      render();
    }),
  );
  q('[data-minimize]').addEventListener('click', () => {
    const mini = root.classList.toggle('is-mini');
    q('[data-minimize]').setAttribute('aria-expanded', String(!mini));
  });
  // Small screens start collapsed so the player does not cover the page.
  if (matchMedia('(max-width: 600px)').matches) {
    root.classList.add('is-mini');
    q('[data-minimize]').setAttribute('aria-expanded', 'false');
  }
  render();
  drawViz();
}
