// Blog pages: shared navbar and petals, the post list on /blog/ and prev/next links on a post.
import { mountNav } from './nav.js';
import { mountPetals } from './petals.js';
import { POSTS } from './posts.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

mountNav({ current: '/blog/' });
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) mountPetals(document.querySelector('#petals'));

// A tear-off calendar page (日めくり) for the post date.
const calendar = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return `<time class="himekuri" datetime="${date}"><span class="himekuri__month">${MONTHS[m - 1]}</span><span class="himekuri__day">${d}</span><span class="himekuri__year">${y}</span></time>`;
};

const tags = (post) => `<ul class="tags">${post.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

function card(post) {
  if (post.soon) {
    return `
      <li class="entry entry--soon">
        <span class="himekuri himekuri--blank" aria-hidden="true"><span class="himekuri__month">SOON</span><span class="himekuri__day">…</span></span>
        <div class="entry__body">
          <p class="entry__ja">${esc(post.titleJa)}</p>
          <h3 class="entry__title">${esc(post.title)}</h3>
          <p class="entry__summary">${esc(post.summary)}</p>
          ${tags(post)}
        </div>
        <span class="entry__stamp">準備中<small>Coming soon</small></span>
      </li>`;
  }
  return `
    <li class="entry">
      ${calendar(post.date)}
      <div class="entry__body"${post.lang ? ` lang="${post.lang}"` : ''}>
        <img class="entry__thumb" src="/assets/blog/${post.slug}/cover.png" alt="" width="1200" height="675" loading="lazy" />
        <p class="entry__ja">${esc(post.titleJa)}${post.lang === 'vi' ? '<span class="entry__lang">Tiếng Việt</span>' : ''}</p>
        <h3 class="entry__title"><a href="/blog/${post.slug}/">${esc(post.title)}</a></h3>
        <p class="entry__summary">${esc(post.summary)}</p>
        <div class="entry__meta">${tags(post)}<span class="entry__time">${post.minutes} min read</span></div>
      </div>
    </li>`;
}

const list = document.querySelector('[data-posts]');
if (list) list.innerHTML = POSTS.map(card).join('');

// On a post page, link the neighbouring published posts.
const slug = document.body.dataset.slug;
const pager = document.querySelector('[data-post-nav]');
if (slug && pager) {
  const published = POSTS.filter((p) => !p.soon);
  const i = published.findIndex((p) => p.slug === slug);
  const link = (post, dir) =>
    post ? `<a class="pager__link pager__link--${dir}" href="/blog/${post.slug}/"><small>${dir === 'newer' ? '← Newer' : 'Older →'}</small>${esc(post.title)}</a>` : '<span></span>';
  pager.innerHTML = link(published[i - 1], 'newer') + link(published[i + 1], 'older');
}
