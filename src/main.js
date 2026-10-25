import { profile } from './profile.js';
import { renderSections, renderQuest } from './sections.js';
import { mountScene } from './scene.js';
import { mountPetals } from './petals.js';
import { mountPlayer } from './lofi-player.js';
import { mountDecor } from './decor.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

renderSections();
mountDecor();
mountScene(document.querySelector('#scene'), { reducedMotion });
if (!reducedMotion) mountPetals(document.querySelector('#petals'));
const player = mountPlayer(document.querySelector('#player'));

// Typewriter cycling through roles in the hero.
function typewriter(el, words) {
  if (reducedMotion) {
    el.textContent = words[0];
    return;
  }
  let word = 0;
  let chars = 0;
  let deleting = false;
  (function tick() {
    const text = words[word];
    chars += deleting ? -1 : 1;
    el.textContent = text.slice(0, chars);
    let delay = deleting ? 45 : 95;
    if (!deleting && chars === text.length) {
      deleting = true;
      delay = 1600;
    } else if (deleting && chars === 0) {
      deleting = false;
      word = (word + 1) % words.length;
      delay = 400;
    }
    setTimeout(tick, delay);
  })();
}
typewriter(document.querySelector('[data-typer]'), profile.roles);

// Re-roll the vitals bars.
document.querySelector('[data-roll]').addEventListener('click', () => {
  document.querySelectorAll('.vital').forEach((v) => {
    const value = 88 + Math.floor(Math.random() * 12);
    v.querySelector('[data-vital-value]').textContent = `${value}%`;
    v.querySelector('.fill').style.width = `${value}%`;
  });
});

// Quest log: ledger selection, prev/next, and the compact view toggle.
let quest = 0;
const showQuest = (i) => {
  quest = Math.max(0, Math.min(profile.quests.length - 1, i));
  renderQuest(quest);
};
document.querySelector('[data-quests]').addEventListener('click', (e) => {
  const item = e.target.closest('[data-quest]');
  const step = e.target.closest('[data-quest-step]');
  if (item) showQuest(Number(item.dataset.quest));
  if (step) showQuest(quest + Number(step.dataset.questStep));
});
document.querySelectorAll('[data-quest-view]').forEach((tab) =>
  tab.addEventListener('click', () => {
    const compact = tab.dataset.questView === 'compact';
    document.querySelectorAll('[data-quest-view]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelector('[data-quests]').hidden = compact;
    document.querySelector('[data-compact]').hidden = !compact;
  }),
);

// Skill grid filters.
document.querySelectorAll('[data-filter]').forEach((tab) =>
  tab.addEventListener('click', () => {
    const group = tab.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelectorAll('.skill-tile').forEach((tile) => {
      tile.hidden = group !== 'all' && tile.dataset.group !== group;
    });
  }),
);

// Highlight the nav link of the section in view.
const links = [...document.querySelectorAll('.nav__links a')];
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id ? `#${e.target.id}` : '#top';
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    }),
  { rootMargin: '-45% 0px -50% 0px' },
);
document.querySelectorAll('.hero, .section').forEach((el) => spy.observe(el));

// Navbar: local Vietnam time sets day or night for the page (the hero scene reads
// html[data-sky]); the clock button flips it until the next reload.
const nav = document.querySelector('[data-nav]');
const clock = document.querySelector('[data-clock]');
const sky = document.querySelector('[data-sky]');
const skyToggle = document.querySelector('[data-sky-toggle]');
const skyLabel = document.querySelector('[data-sky-label]');
const vnTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
let skyOverride = null;
function tick() {
  const time = vnTime.format(new Date());
  const hour = Number(time.slice(0, 2));
  const night = skyOverride ? skyOverride === 'night' : hour < 6 || hour >= 18;
  clock.textContent = time;
  document.documentElement.dataset.sky = night ? 'night' : 'day';
  sky.classList.toggle('is-night', night);
  skyLabel.textContent = night ? 'Switch to day' : 'Switch to night';
}
tick();
setInterval(tick, 30_000);
skyToggle.addEventListener('click', () => {
  skyOverride = document.documentElement.dataset.sky === 'night' ? 'day' : 'night';
  tick();
});

addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 8), { passive: true });

const menu = document.querySelector('[data-menu]');
const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
};
menu.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menu.focus();
  }
});

// Welcome screen: stays until the page has loaded (at least briefly, at most a few seconds).
const intro = document.querySelector('[data-intro]');
if (!document.documentElement.classList.contains('intro-seen')) {
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  Promise.race([Promise.all([loaded, document.fonts.ready, wait(1100)]), wait(3500)]).then(() => {
    intro.classList.add('is-done');
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {}
  });
} else {
  intro.remove();
}

// Tet easter egg: type "tet" or the Konami code (or press the footer hint) for fireworks
// over the river and a festive track on the radio.
const SECRETS = ['t,e,t', 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'];
let typed = [];
function celebrate() {
  document.querySelector('.hero').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  dispatchEvent(new CustomEvent('festival'));
  player.playFestive();
  document.querySelector('.toast')?.remove();
  document.body.insertAdjacentHTML(
    'beforeend',
    '<p class="toast" role="status"><span class="toast__ja">明けましておめでとう</span>Happy Tet! Wishing you a lucky new year</p>',
  );
  setTimeout(() => document.querySelector('.toast')?.remove(), 6000);
}
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, [contenteditable]') || (e.key.length > 1 && !e.key.startsWith('Arrow'))) return;
  typed = [...typed, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-10);
  if (SECRETS.some((code) => typed.join(',').endsWith(code))) {
    typed = [];
    celebrate();
  }
});
document.querySelector('[data-festival]').addEventListener('click', celebrate);
