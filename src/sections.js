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
    <div class="passport panel">
      <div class="panel__bar">
        <span class="panel__tag">${esc(a.passportLabel)}</span>
        <span class="panel__title">${esc(a.passportTitle)}</span>
        <span class="panel__level"><span class="dot dot--green"></span>${esc(a.level)}</span>
      </div>
      <div class="passport__body">
        <div class="passport__side">
          <div class="stats">
            ${a.stats
              .map(
                (s) => `
              <div class="stat stat--${s.color}">
                <p class="stat__label">[${esc(s.label)}]</p>
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
          <p class="label">Primary Arts · 主要技術</p>
          <ul class="badges">${a.skills.map(skillBadge).join('')}</ul>
        </div>
        <div class="passport__story">
          <div class="story__head"><p class="label"><span class="sq sq--red"></span>Chronicles of Craft · 冒険譚</p><span class="mini-tag">Chapter 1</span></div>
          ${a.story.map((p) => `<p class="story__p">${esc(p)}</p>`).join('')}
          <div class="featured">
            <p class="featured__head"><span class="mini-tag mini-tag--red">Featured Quest</span><strong>${esc(a.featured.name)}</strong><a href="${esc(a.featured.url)}">Launch ↗</a></p>
            <p>${esc(a.featured.text)}</p>
          </div>
          <blockquote class="quote">${esc(a.quote)}</blockquote>
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

function questDetail(q, i, total) {
  return `
    <div class="quest-detail__bar">
      <span class="mini-tag mini-tag--green">${i === 0 ? 'Active Chronicle' : 'Past Chronicle'}</span>
      <span class="label">${esc(q.period)}</span>
      <span class="quest-detail__loc"><span class="pin"></span>${esc(q.location)}</span>
    </div>
    <div class="quest-detail__body">
      <h3 class="quest-detail__role">${esc(q.role)}</h3>
      <p class="quest-detail__company">${esc(q.company)}</p>
      <p class="quest-detail__summary">${esc(q.summary)}</p>
      <p class="label"><span class="sq sq--navy"></span>Key Quest Achievements</p>
      <ul class="achievements">${q.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      <ul class="badges">${q.skills.map(skillBadge).join('')}</ul>
    </div>
    <div class="quest-detail__foot">
      <button type="button" class="mini-btn" data-quest-step="-1" ${i === 0 ? 'disabled' : ''}><span class="ico ico--prev" aria-hidden="true"></span>Prev Quest</button>
      <span class="label">Quest ${i + 1} of ${total}</span>
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
        <div class="panel__bar panel__bar--tight"><span class="panel__title">Quest Ledger · 冒険目録</span><span class="panel__level panel__level--gold">✦ ${qs.length} Quests</span></div>
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
      <article class="quest-detail panel" data-quest-detail>${questDetail(qs[0], 0, qs.length)}</article>
    </div>
    <ol class="compact" data-compact hidden>
      ${qs
        .map(
          (q) => `
        <li class="card compact__item">
          <span class="ledger__period">${esc(q.period)}</span>
          <strong>${esc(q.role)}</strong>
          <span class="quest-detail__company">${esc(q.company)}</span>
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
