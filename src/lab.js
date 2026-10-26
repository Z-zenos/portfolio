// /lab/: shared navbar and petals, and the list of experiments in labs.js.
import { mountNav } from './nav.js';
import { mountPetals } from './petals.js';
import { LABS } from './labs.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

mountNav({ current: '/lab/' });
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) mountPetals(document.querySelector('#petals'));

// Each experiment is a game cartridge: ridged shell, cover art as the label, gold connector pins.
const cartridge = (lab, i) => `
  <li class="cart" style="--i: ${i}">
    <div class="cart__shell">
      <span class="cart__led" title="Live">LIVE</span>
      <div class="cart__label"><img src="/assets/lab/${lab.slug}/cover.png" alt="" width="334" height="188" loading="lazy" /><span class="cart__start" aria-hidden="true">▶ PRESS START</span></div>
      <div class="cart__body"${lab.lang ? ` lang="${lab.lang}"` : ''}>
        <p class="cart__kind"><span>${esc(lab.kind)}</span>${esc(lab.titleJa)}<time datetime="${lab.date}">${lab.date.split('-').reverse().join('.')}</time></p>
        <h2 class="cart__title"><a href="/lab/${lab.slug}/">${esc(lab.title)}</a></h2>
        <p class="cart__summary">${esc(lab.summary)}</p>
        ${lab.stats ? `<dl class="cart__stats">${lab.stats.map(([n, label]) => `<div><dt>${esc(n)}</dt><dd>${esc(label)}</dd></div>`).join('')}</dl>` : ''}
        <ul class="tags">${lab.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <span class="cart__pins" aria-hidden="true"></span>
    </div>
  </li>`;

// An empty slot on the shelf for the next experiment.
const emptySlot = `<li class="cart cart--empty" aria-hidden="true"><div class="cart__slot"><span>研</span>Next experiment<small>in the workshop</small></div></li>`;

document.querySelector('[data-lab-count]').textContent = `${LABS.length} experiment${LABS.length === 1 ? '' : 's'}  ${LABS.map((l) => l.slug + '/').join('  ')}`;
document.querySelector('[data-labs]').innerHTML = LABS.map(cartridge).join('') + emptySlot;
