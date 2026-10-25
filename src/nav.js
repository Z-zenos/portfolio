// Shared navbar for every page: markup, the Vietnam clock that sets day or night (the hero scene
// reads html[data-sky]), the light/dark theme toggle, compact-on-scroll and the mobile menu.
import { profile } from './profile.js';

const LINKS = [
  ['/#top', '家', 'Home'],
  ['/#about', '伝', 'About'],
  ['/#exp', '歴', 'Exp'],
  ['/#work', '術', 'Work'],
  ['/blog/', '記', 'Blog'],
  ['/#contact', '結', 'Contact'],
];

const template = () => `
  <a class="nav__logo" href="/#top" aria-label="Back to top">
    <img class="nav__mark" src="/assets/favicon.svg" width="24" height="32" alt="" />
    <span class="nav__brand"><span>${profile.domain}</span><span class="nav__tag">トゥアンの工房</span></span>
  </a>
  <nav class="nav__links" id="nav-links" aria-label="Primary">
    ${LINKS.map(([href, kanji, label]) => `<a href="${href}"><span class="nav__kanji" aria-hidden="true">${kanji}</span>${label}</a>`).join('')}
  </nav>
  <div class="nav__right">
    <button type="button" class="nav__clock" data-sky-toggle title="Local time in Vietnam · click to switch day and night"><span class="nav__sky" data-sky aria-hidden="true"></span><span data-clock>--:--</span><small>VN</small><span class="sr-only" data-sky-label>Switch to night</span></button>
    <button type="button" class="nav__theme" data-theme-toggle aria-pressed="false" title="Light or dark theme"><span aria-hidden="true" data-theme-glyph>明</span><span class="sr-only">Dark mode</span></button>
    <a class="btn btn--red btn--sm nav__resume" href="/#contact">Resume ↗</a>
    <button type="button" class="nav__menu" data-menu aria-expanded="false" aria-controls="nav-links" aria-label="Open menu"><i></i><i></i><i></i></button>
  </div>`;

function mountClock(nav) {
  const clock = nav.querySelector('[data-clock]');
  const sky = nav.querySelector('[data-sky]');
  const label = nav.querySelector('[data-sky-label]');
  const vnTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  let override = null;
  function tick() {
    const time = vnTime.format(new Date());
    const hour = Number(time.slice(0, 2));
    const night = override ? override === 'night' : hour < 6 || hour >= 18;
    clock.textContent = time;
    document.documentElement.dataset.sky = night ? 'night' : 'day';
    sky.classList.toggle('is-night', night);
    label.textContent = night ? 'Switch to day' : 'Switch to night';
  }
  tick();
  setInterval(tick, 30_000);
  nav.querySelector('[data-sky-toggle]').addEventListener('click', () => {
    override = document.documentElement.dataset.sky === 'night' ? 'day' : 'night';
    tick();
  });
}

// Light (明) or dark (暗). An explicit choice is remembered; until then the page follows the system.
function mountTheme(nav) {
  const toggle = nav.querySelector('[data-theme-toggle]');
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = (theme) => {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.querySelector('[data-theme-glyph]').textContent = dark ? '暗' : '明';
    meta.content = dark ? '#161826' : '#fbf8f0';
  };
  apply(document.documentElement.dataset.theme);
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch {}
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });
}

function mountMenu(nav, links) {
  const menu = nav.querySelector('[data-menu]');
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
}

// Renders the navbar into header[data-nav]. `current` marks a page link (e.g. '/blog/') active;
// the home page instead highlights links as sections scroll into view. Returns the links.
export function mountNav({ current } = {}) {
  const nav = document.querySelector('[data-nav]');
  nav.innerHTML = template();
  const links = [...nav.querySelectorAll('.nav__links a')];
  if (current) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === current));
  mountClock(nav);
  mountTheme(nav);
  mountMenu(nav, links);
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
  return links;
}
