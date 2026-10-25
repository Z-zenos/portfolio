// Renders every section from profile.js into the page shell.
import { profile, SKILLS, SKILL_GROUPS } from './profile.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const devicon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}.svg`;
const iconUrl = (key) => devicon(SKILLS[key].icon);
// Pixel icons painted by Codex (assets/icons), and the real GitHub and LinkedIn logos.
const pix = (name) => `<img class="pxi" src="assets/icons/${name}.png" alt="" aria-hidden="true" />`;
const brand = (path) => `<img class="pxi pxi--brand" src="${devicon(path)}" alt="" aria-hidden="true" />`;
const KANJI_NUMBERS = ['壱', '弐', '参', '肆', '伍', '陸'];
// Corner characters on the mahjong skill tiles: server (saba, Japanese slang), screen, storehouse, cloud.
const SUITS = { backend: '鯖', frontend: '画', data: '蔵', devops: '雲' };
// Today's date written the way a rirekisho is dated, e.g. 2026年10月26日.
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const GITHUB = brand('github/github-original');
const LINKEDIN = brand('linkedin/linkedin-original');

export const skillBadge = (key) =>
  `<li class="badge"><img src="${iconUrl(key)}" alt="" width="16" height="16" loading="lazy" />${esc(SKILLS[key].label)}</li>`;

const sectionHead = ({ glyph, color, chapter, title, subtitle }) => `
  <header class="sec-head">
    <p class="sec-head__chapter"><span class="tile tile--${color}">${glyph}</span>「 ${chapter} 」</p>
    <h2 class="sec-head__title">${title}</h2>
    <p class="sec-head__sub">${subtitle}</p>
  </header>`;

function hero() {
  const { links } = profile;
  return `
    <p class="chip"><span class="dot dot--green"></span>${esc(profile.status)}</p>
    <p class="hero__ja"><span class="tile tile--red">越</span>「 ${esc(profile.nameJa)} 」<span class="hero__ja-mark"></span></p>
    <h1 class="hero__name">${esc(profile.name)}</h1>
    <p class="typer"><span class="typer__prompt">&gt;</span> <span data-typer></span><span class="typer__caret"></span></p>
    <p class="hero__meta"><span class="pin"></span>${esc(profile.location)} <span class="sep">•</span> ${esc(profile.experience)}</p>
    <ul class="badges">${profile.heroSkills.map(skillBadge).join('')}</ul>
    <div class="row">
      <a class="btn btn--red btn--lg" href="${esc(links.resume)}">${pix('scroll')}View Resume</a>
      <a class="btn btn--lg" href="#exp">↓ Adventure Log</a>
    </div>
    <div class="row row--sm">
      <a class="btn btn--sm" href="${esc(links.github)}" rel="noopener">${GITHUB}GitHub</a>
      <a class="btn btn--sm" href="${esc(links.linkedin)}" rel="noopener">${LINKEDIN}LinkedIn</a>
      <a class="btn btn--sm" href="mailto:${esc(links.email)}">${pix('mail')}Email</a>
      <a class="btn btn--sm btn--red" href="${esc(links.featured.url)}">${pix('bolt')}${esc(links.featured.label)}</a>
    </div>`;
}

function about() {
  const a = profile.about;
  return `
    ${sectionHead({ glyph: '伝', color: 'red', chapter: '第一章 • 自己紹介', title: 'Player Profile &amp; Origin', subtitle: esc(a.subtitle) })}
    <div class="rireki">
      <header class="rireki__top">
        <h3 class="rireki__title">履 歴 書<small>Résumé · Engineer Record</small></h3>
        <p class="rireki__date">${today()}現在<small>as of today</small></p>
      </header>
      <div class="rireki__body">
        <div class="rireki__side">
          <div class="rireki__id">
            <dl class="rireki__fields">
              <div class="field"><dt>ふりがな</dt><dd class="field__kana">${esc(profile.nameJa)}</dd></div>
              <div class="field field--name"><dt>氏名<small>Name</small></dt><dd>${esc(profile.name)}<span class="field__seal" aria-hidden="true">印</span></dd></div>
              <div class="field"><dt>現住所<small>Address</small></dt><dd>${esc(profile.location)}</dd></div>
              <div class="field"><dt>状態<small>Status</small></dt><dd><span class="dot dot--green"></span>${esc(a.level)}</dd></div>
            </dl>
            <figure class="rireki__photo"><img src="${esc(a.photo)}" alt="" /><figcaption>写真</figcaption></figure>
          </div>
          <p class="rireki__label">能力<small>Stats</small></p>
          <div class="stats">
            ${a.stats
              .map(
                (s) => `
              <div class="stat stat--${s.color}">
                <p class="stat__label"><span class="stat__ja">${esc(s.ja)}</span>${esc(s.label)}</p>
                <p class="stat__value">${esc(s.value)}</p>
                <p class="stat__note">${esc(s.note)}</p>
              </div>`,
              )
              .join('')}
          </div>
          <div class="vitals">
            <div class="vitals__head"><span>System Vitals · 能力値</span><button type="button" class="mini-btn" data-roll>${pix('dice')}Roll</button></div>
            ${a.vitals
              .map(
                (v) => `
              <div class="vital">
                <p><span>${esc(v.label)}</span><span data-vital-value>${v.value}%</span></p>
                <div class="vital__bar"><span class="fill fill--${v.color}" style="width:${v.value}%"></span></div>
              </div>`,
              )
              .join('')}
          </div>
          <p class="rireki__label">免許・資格<small>Primary Arts</small></p>
          <ul class="badges">${a.skills.map(skillBadge).join('')}</ul>
        </div>
        <div class="rireki__main">
          <section class="rireki__box">
            <p class="rireki__label">自己PR<small>Chronicles of Craft</small></p>
            <div class="rireki__ruled">${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </section>
          <section class="rireki__box rireki__box--featured">
            <p class="rireki__label">特記事項<small>Featured Quest</small><a href="${esc(a.featured.url)}">Launch ↗</a></p>
            <p class="rireki__featured-name">${esc(a.featured.name)}</p>
            <p>${esc(a.featured.text)}</p>
          </section>
          <section class="rireki__box">
            <p class="rireki__label">本人希望記入欄<small>Motto</small></p>
            <blockquote class="rireki__motto">${esc(a.quote)}</blockquote>
          </section>
        </div>
      </div>
    </div>

    <div class="expertise">
      <h3 class="label-title">Areas of Expertise</h3>
      <p class="muted center">Craft domains built for reliability and delight</p>
      <div class="ema-rack">
        ${profile.expertise
          .map(
            (e, i) => `
          <article class="ema ema--${e.color}">
            <div class="ema__board">
              <div class="ema__face">
                <span class="ema__no" aria-hidden="true">${KANJI_NUMBERS[i]}</span>
                <span class="ema__seal">${pix(e.icon)}</span>
                <h4 class="ema__title">${esc(e.title)}</h4>
                <p class="ema__text">${esc(e.text)}</p>
                <p class="ema__tag">${esc(e.tag)}</p>
              </div>
            </div>
          </article>`,
          )
          .join('')}
      </div>
      <div class="row row--center">
        <a class="btn btn--red btn--lg" href="${esc(profile.links.resume)}">${pix('scroll')}View Complete Resume</a>
        <a class="btn btn--lg" href="#contact">${pix('mail')}Get in Touch</a>
      </div>
    </div>`;
}

// Company initials for the red seal on the scroll, e.g. "Your Company" -> "YC".
const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// The selected quest as a Vietnamese altar board set: a hoành phi (horizontal board) in a hồi văn
// frame with a gilded lotus crest, a pair of câu đối (vertical couplet boards) and paper between them.
function questDetail(q, i, total) {
  return `
    <header class="hoanh-phi">
      <img class="hoanh-phi__crest" src="assets/viet/lotus.png" alt="" aria-hidden="true" />
      <div class="hoanh-phi__board">
        <p class="hoanh-phi__status"><span class="vi">${i === 0 ? 'Hiện tại' : 'Đã qua'}</span>${i === 0 ? 'Active Chronicle' : 'Past Chronicle'}</p>
        <h3 class="hoanh-phi__role">${esc(q.role)}</h3>
        <p class="hoanh-phi__company"><span class="hoanh-phi__seal" aria-hidden="true">${esc(initials(q.company))}</span>${esc(q.company)}</p>
      </div>
    </header>
    <div class="altar__middle">
      <p class="cau-doi"><span class="sr-only">Period: </span>${esc(q.period)}</p>
      <div class="altar__paper">
        <p class="altar__summary">${esc(q.summary)}</p>
        <p class="altar__label">Key Quest Achievements<span class="vi">Thành tựu</span></p>
        <ol class="achievements">${q.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        <ul class="badges">${q.skills.map(skillBadge).join('')}</ul>
      </div>
      <p class="cau-doi"><span class="sr-only">Location: </span>${esc(q.location)}</p>
    </div>
    <div class="altar__foot">
      <button type="button" class="mini-btn" data-quest-step="-1" ${i === 0 ? 'disabled' : ''}><span class="ico ico--prev" aria-hidden="true"></span>Prev Quest</button>
      <span class="altar__count">Chapter ${i + 1} of ${total}<span class="vi">Hồi ${i + 1}</span></span>
      <button type="button" class="mini-btn" data-quest-step="1" ${i === total - 1 ? 'disabled' : ''}>Next Quest<span class="ico ico--play" aria-hidden="true"></span></button>
    </div>`;
}

function experience() {
  const qs = profile.quests;
  return `
    ${sectionHead({ glyph: '歴', color: 'navy', chapter: '第二章 • 職務経歴', title: 'Adventure Log', subtitle: 'Years of building backend services, web apps and small pixel worlds' })}
    <div class="seg" role="tablist">
      <button type="button" role="tab" aria-selected="true" data-quest-view="interactive">◆ Interactive Quest Log</button>
      <button type="button" role="tab" aria-selected="false" data-quest-view="compact">≡ Compact Overview</button>
    </div>
    <div class="quests" data-quests>
      <div class="ledger">
        <div class="ledger__head"><span>Quest Ledger<span class="vi">Sổ hành trình</span></span><span class="ledger__count">✦ ${qs.length} Quests</span></div>
        ${qs
          .map(
            (q, i) => `
          <button type="button" class="ledger__item" data-quest="${i}" aria-pressed="${i === 0}">
            <span class="ledger__top"><span class="ledger__tags"><span class="ico ico--play" aria-hidden="true"></span><span class="mini-tag ${i === 0 ? 'mini-tag--green' : 'mini-tag--navy'}">${esc(q.badge)}</span></span><span class="ledger__period">${esc(q.period)}</span></span>
            <span class="ledger__company">${esc(q.company)}</span>
            <span class="ledger__role">${esc(q.role)}</span>
          </button>`,
          )
          .join('')}
      </div>
      <article class="altar" data-quest-detail>${questDetail(qs[0], 0, qs.length)}</article>
    </div>
    <ol class="compact" data-compact hidden>
      ${qs
        .map(
          (q) => `
        <li class="card compact__item">
          <span class="ledger__period">${esc(q.period)}</span>
          <strong>${esc(q.role)}</strong>
          <span class="compact__company">${esc(q.company)}</span>
          <p>${esc(q.summary)}</p>
        </li>`,
        )
        .join('')}
    </ol>`;
}

function work() {
  return `
    ${sectionHead({ glyph: '術', color: 'green', chapter: '第三章 • 技術と実績', title: 'Skill Tree &amp; Artifacts', subtitle: 'Technologies, frameworks and infrastructure used in production' })}
    <div class="filters" role="tablist">
      ${SKILL_GROUPS.map((g, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-filter="${g.key}">${esc(g.label)}</button>`).join('')}
    </div>
    <ul class="skill-grid">
      ${Object.entries(SKILLS)
        .map(
          ([key, s]) => `
        <li class="skill-tile skill-tile--${s.group}" data-group="${s.group}">
          <span class="skill-tile__body">
            <span class="skill-tile__face">
              <span class="skill-tile__suit" aria-hidden="true">${SUITS[s.group]}</span>
              <img src="${iconUrl(key)}" alt="" width="40" height="40" loading="lazy" />
              <span>${esc(s.label)}</span>
            </span>
          </span>
        </li>`,
        )
        .join('')}
    </ul>

    <h3 class="label-title">Featured Quest Projects</h3>
    <p class="muted center">Pixel worlds, web platforms and open-source software</p>
    <div class="projects">
      ${profile.projects
        .map(
          (p, i) => `
        <article class="ticket${i === 0 ? ' ticket--featured' : ''}">
          <div class="ticket__stub">
            <span class="ticket__logo">${esc(p.logo)}</span>
            <span class="ticket__kanji" aria-hidden="true">乗車券</span>
            <span class="ticket__no">No.${String(i + 1).padStart(3, '0')}</span>
          </div>
          <div class="ticket__body">
            <p class="ticket__line"><span>${i === 0 ? '特急' : '普通'}</span>${i === 0 ? 'Limited Express' : 'Local Line'} · Platform ${i + 1}</p>
            <h4 class="ticket__name">${esc(p.name)}</h4>
            <p class="ticket__sub">${esc(p.subtitle)}</p>
            <p class="ticket__text">${esc(p.text)}</p>
            <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            <a class="btn ${i === 0 ? 'btn--red' : ''}" href="${esc(p.link.url)}" rel="noopener">↗ ${esc(p.link.label)}</a>
          </div>
          <span class="ticket__stamp ticket__stamp--${p.badge.color}">${esc(p.badge.text)}</span>
        </article>`,
        )
        .join('')}
    </div>
    <div class="row row--center">
      <a class="btn btn--lg" href="${esc(profile.links.github)}" rel="noopener">&lt;&gt; View All Repositories on GitHub ↗</a>
    </div>`;
}

function contact() {
  const { links } = profile;
  return `
    ${sectionHead({ glyph: '結', color: 'red', chapter: '結び • 連絡', title: 'Send a Lantern', subtitle: '' })}
    <p class="contact__text">${esc(profile.contact.text)}</p>
    <div class="transmit">
      <p class="label"><span class="sq sq--green"></span>Transmit Message · Email / LinkedIn</p>
      <div class="row row--center">
        <a class="btn btn--red btn--lg" href="mailto:${esc(links.email)}">${pix('mail')}Send Email (${esc(links.email)})</a>
        <a class="btn btn--lg" href="${esc(links.resume)}">${pix('scroll')}View Resume ↗</a>
      </div>
    </div>
    <div class="row row--center row--sm">
      <a class="btn btn--sm" href="${esc(links.github)}" rel="noopener">${GITHUB}GitHub</a>
      <a class="btn btn--sm" href="${esc(links.linkedin)}" rel="noopener">${LINKEDIN}LinkedIn</a>
      <a class="btn btn--sm" href="${esc(links.featured.url)}">${pix('bolt')}${esc(links.featured.label)}</a>
      <a class="btn btn--sm" href="mailto:${esc(links.email)}">${pix('mail')}Email</a>
    </div>
    <div class="row row--center">
      <a class="btn btn--sm" href="#top">↑ Return to Top ↑</a>
    </div>
    <p class="footer"><span class="tile tile--red tile--xs">印</span>© ${new Date().getFullYear()} ${esc(profile.name)}</p>
    <button type="button" class="footer__egg" data-festival>psst… type <kbd>t</kbd><kbd>e</kbd><kbd>t</kbd> anywhere, or tap here ${pix('lixi')}</button>`;
}

export function renderSections() {
  document.querySelector('[data-hero]').innerHTML = hero();
  document.querySelector('#about .wrap').innerHTML = about();
  document.querySelector('#exp .wrap').innerHTML = experience();
  document.querySelector('#work .wrap').innerHTML = work();
  document.querySelector('#contact .wrap').innerHTML = contact();
  document.title = `${profile.name} · ${profile.domain.toLowerCase()}`;
  document.querySelector('[data-domain]').textContent = profile.domain;
}

export function renderQuest(i) {
  document.querySelector('[data-quest-detail]').innerHTML = questDetail(profile.quests[i], i, profile.quests.length);
  document.querySelectorAll('[data-quest]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.quest) === i)));
}
