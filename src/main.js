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
mountPlayer(document.querySelector('#player'));

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
const links = [...document.querySelectorAll('.nav nav a')];
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
