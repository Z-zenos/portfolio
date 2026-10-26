// /lab/aws-saa/: the SAA-C03 study dojo. Loads data.json (groups, decision trees, confusable pairs,
// flashcards and the service graph) and renders six modes: codex, decision trees, A vs B,
// flashcards (Leitner boxes kept in localStorage), numbers and the service link graph.
import { mountNav } from './nav.js';
import { mountPetals } from './petals.js';

mountNav({ current: '/lab/' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) mountPetals(document.querySelector('#petals'));

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Inline markdown subset: `code`, **bold**, and [text](https://…) as a small source link. Escapes first.
const md = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a class="src-link" href="$2" target="_blank" rel="noopener">$1 ↗</a>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, '<br>');
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('saa.' + k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('saa.' + k, JSON.stringify(v));
    } catch {}
  },
};
const num = (n) => n.toLocaleString('vi-VN');
const ICONS = '/assets/lab/aws-saa/icons/';
const SERVICE_ICONS = '/assets/lab/aws-saa/services/';

// d3 (graph), markmap (mindmap) and the graph data are only fetched when a view needs them.
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const el = Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject });
    document.head.append(el);
  });
let d3Ready, markmapReady, graphReady;
const needD3 = () => (d3Ready ??= loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js'));
const needMarkmap = () => (markmapReady ??= needD3().then(() => loadScript('https://cdn.jsdelivr.net/npm/markmap-view@0.18.12/dist/browser/index.js')));
const icon = (name, cls = 'px-icon') => `<img class="${cls}" src="${ICONS}${name}.png" alt="" width="16" height="16" />`;

// One colour per knowledge group, drawn from the site palette; used by chips, cards and graph nodes.
const PALETTE = ['#e0362c', '#2c3e5e', '#3e8e41', '#f0a531', '#e2627e', '#5d7cc0', '#8a5a34', '#2f8f8a', '#a8241d', '#7a5ea8', '#c98612', '#4f6b3a', '#d9693b', '#3d4a6b'];

const MODES = [
  ['map', '地図', 'Atlas', 'Tra cứu service'],
  ['trees', '分岐', 'Crossroads', 'Cây quyết định'],
  ['vs', '対決', 'Versus', 'Cặp dễ nhầm'],
  ['cards', '札', 'Flashcards', 'Luyện thẻ'],
  ['facts', '数', 'Numbers', 'Số liệu'],
  ['links', '縁', 'Threads', 'Đường nối'],
];
const VIEWS = MODES.map((m) => m[0]);

let D;
try {
  const res = await fetch('/lab/aws-saa/data.json');
  if (!res.ok) throw new Error(res.status);
  D = await res.json();
} catch {
  $('[data-load]').innerHTML = '<p class="dojo-load__text">Không tải được dữ liệu sổ tay. Kiểm tra kết nối rồi tải lại trang.</p>';
  throw new Error('data.json failed to load');
}
$('[data-load]').remove();

const GROUP_IDS = D.groups.map((g) => g.id);
const groupById = new Map(D.groups.map((g) => [g.id, g]));
const groupColor = (id) => PALETTE[GROUP_IDS.indexOf(id)] || 'var(--ink-soft)';
const splitTitle = (t) => {
  const [en, ...rest] = t.split(' — ');
  return [en, rest.join(' — ')];
};
const groupTitle = (id) => {
  const g = groupById.get(id);
  if (g) return splitTitle(g.title)[0];
  return { traps: 'Bẫy', patterns: 'Pattern', vs: 'A vs B' }[id] || (id.startsWith('kw-') ? 'Keyword đề' : id);
};
const stars = (freq) => (freq ? `<span class="stars" title="Mức độ hay ra đề">${'<i></i>'.repeat(freq.length)}</span>` : '');

/* ---------- state, mode bar and group filter ---------- */

const savedView = store.get('view', 'map');
let view = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : VIEWS.includes(savedView) ? savedView : 'map';
let group = store.get('group', 'all');
if (group !== 'all' && !groupById.has(group)) group = 'all';

const services = D.groups.flatMap((g) => g.services);
$('[data-counts]').innerHTML = [
  [D.groups.length, 'nhóm'],
  [services.length, 'service'],
  [D.trees.length, 'cây quyết định'],
  [D.confusable.length, 'cặp dễ nhầm'],
  [D.cards.length, 'flashcard'],
  [D.graph.problem_count, 'bài toán'],
]
  .map(([n, label]) => `<div><dt>${num(n)}</dt><dd>${label}</dd></div>`)
  .join('');

$('[data-modes]').innerHTML = MODES.map(
  ([id, kanji, en, vi]) => `
  <button type="button" role="tab" id="tab-${id}" class="mode" data-view="${id}" aria-controls="view-${id}" aria-selected="false">
    ${icon(id, 'mode__icon')}
    <span class="mode__text"><span class="mode__en"><span class="mode__kanji" lang="ja">${kanji}</span>${en}</span><span class="mode__vi">${vi}</span></span>
    ${id === 'cards' ? '<span class="mode__badge" data-due hidden></span>' : ''}
  </button>`,
).join('');

// The group filter is a row of inventory slots: one pixel icon per knowledge group.
function renderRealms() {
  const slots = [['all', 'Tất cả nhóm', 'book'], ...D.groups.map((g) => [g.id, splitTitle(g.title)[0], g.id])];
  const now = group === 'all' ? 'Tất cả nhóm' : `${group} · ${splitTitle(groupById.get(group).title)[0]}`;
  $('[data-realms]').innerHTML = `<div class="slots">${slots
    .map(
      ([id, label, ic]) =>
        `<button type="button" class="slot" data-g="${id}" aria-pressed="${id === group}" title="${esc(label)}" style="--c: ${id === 'all' ? 'var(--ink)' : groupColor(id)}">${icon(ic, 'slot__icon')}<span class="slot__no">${id === 'all' ? '全' : id}</span><span class="sr-only">${esc(label)}</span></button>`,
    )
    .join('')}</div><p class="realms__now"><span class="px-en">Realm</span>${esc(now)}</p>`;
}
function setGroup(id) {
  group = id;
  store.set('group', id);
  renderRealms();
  renderCurrent();
  $(`[data-realms] [data-g="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
}
$('[data-realms]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-g]');
  if (b) setGroup(b.dataset.g);
});

function setView(v, { scroll = false } = {}) {
  view = v;
  store.set('view', v);
  history.replaceState(null, '', '#' + v);
  for (const b of document.querySelectorAll('.mode')) b.setAttribute('aria-selected', String(b.dataset.view === v));
  for (const id of VIEWS) $('#view-' + id).hidden = id !== v;
  renderCurrent();
  if (scroll) $('[data-modes]').scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
}
$('[data-modes]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-view]');
  if (b) setView(b.dataset.view, { scroll: scrollY > $('[data-modes]').offsetTop });
});
// Arrow keys move between tabs, as in a tablist.
$('[data-modes]').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const i = VIEWS.indexOf(view) + (e.key === 'ArrowRight' ? 1 : -1);
  const next = VIEWS[(i + VIEWS.length) % VIEWS.length];
  setView(next);
  $('#tab-' + next).focus();
});
addEventListener('hashchange', () => {
  const v = location.hash.slice(1);
  if (VIEWS.includes(v) && v !== view) setView(v);
});

function renderCurrent() {
  ({ map: renderMap, trees: renderTrees, vs: renderVs, cards: renderCards, facts: renderFacts, links: renderLinks })[view]();
}

/* ---------- codex ---------- */

const PART_KEY = {
  'Use case': 'use',
  'Key features': 'key',
  Architecture: 'arch',
  'Limitation / Trade-off': 'limit',
  'Dễ nhầm với': 'conf',
  'Tín hiệu đề thi': 'signal',
  // Architecture patterns (group 14) use their own four sections.
  'Bài toán': 'use',
  'Giải pháp': 'key',
  'Luồng kiến trúc': 'arch',
  'Trade-off': 'limit',
};
const flatText = (items) => items.map((b) => b.text + ' ' + flatText(b.children)).join(' ');
const SEARCH_TEXT = new Map(
  services.map((s) => [s, [s.heading, s.what, s.one_liner, s.signals, ...s.parts.map((p) => flatText(p.items))].join(' ').toLowerCase()]),
);
const bullets = (items) => (items.length ? `<ul>${items.map((b) => `<li>${md(b.text)}${bullets(b.children)}</li>`).join('')}</ul>` : '');

function realmCard(g, i) {
  const [en, vi] = splitTitle(g.title);
  const hot = g.services.filter((s) => s.freq === '★★★').length;
  return `<button type="button" class="realm" data-g="${g.id}" style="--c: ${groupColor(g.id)}; --i: ${i}">
    ${icon(g.id, 'realm__icon')}
    <span class="realm__no">${g.id}</span>
    <span class="realm__title">${esc(en)}</span>
    ${vi ? `<span class="realm__sub">${esc(vi)}</span>` : ''}
    <span class="realm__meta"><span>${g.services.length} service</span>${hot ? `<span class="realm__hot"><i></i>${hot} rất hay ra</span>` : ''}</span>
  </button>`;
}

function serviceCard(s, i) {
  const [name, sub] = splitTitle(s.heading);
  return `<details class="svc" style="--c: ${groupColor(s.id.slice(0, 2))}; --i: ${Math.min(i, 12)}">
    <summary>
      <span class="svc__head"><img class="svc__icon" src="${sectionIcon(s)}" alt="" width="32" height="32" loading="lazy" /><span class="svc__name">${md(name)}</span>${stars(s.freq)}</span>
      ${sub ? `<span class="svc__sub">${md(sub)}</span>` : ''}
      <span class="svc__line">${md(s.one_liner || s.what)}</span>
      ${s.signals ? `<span class="svc__signals"><b>Tín hiệu</b> ${md(s.signals)}</span>` : ''}
    </summary>
    <div class="svc__body">
      ${s.what && s.one_liner ? `<p class="svc__what">${md(s.what)}</p>` : ''}
      <div class="parts">${s.parts
        .filter((p) => p.items.length)
        .map((p) => `<section class="part part--${PART_KEY[p.label] || 'other'}"><h4>${esc(p.label)}</h4>${bullets(p.items)}</section>`)
        .join('')}</div>
    </div>
  </details>`;
}

function renderMap() {
  const q = $('#map-search').value.trim().toLowerCase();
  const el = $('#codex');
  if (group === 'all' && !q) {
    el.innerHTML = `<div class="realm-grid">${D.groups.map(realmCard).join('')}</div>`;
  } else {
    const groups = group === 'all' ? D.groups : [groupById.get(group)];
    const blocks = groups
      .map((g) => {
        const list = g.services.filter((s) => !q || SEARCH_TEXT.get(s).includes(q));
        if (!list.length) return '';
        const [en, vi] = splitTitle(g.title);
        const head =
          group === 'all'
            ? `<h3 class="codex-group__title" style="--c: ${groupColor(g.id)}">${icon(g.id)}<span>${g.id}</span>${esc(en)}</h3>`
            : `<header class="realm-head" style="--c: ${groupColor(g.id)}">
                ${icon(g.id, 'realm-head__icon')}
                <div><p class="realm-head__no">Nhóm ${g.id} · ${g.domains.map((d) => `<span class="mini-tag">${esc(d)}</span>`).join(' ')}</p>
                <h3 class="realm-head__title">${esc(en)}</h3>${vi ? `<p class="realm-head__sub">${esc(vi)}</p>` : ''}
                <p class="realm-head__intro">${md(g.intro)}</p></div>
              </header>`;
        return `<section class="codex-group">${head}<div class="svc-list">${list.map(serviceCard).join('')}</div></section>`;
      })
      .join('');
    el.innerHTML = blocks || '<p class="empty">Không có service nào khớp.</p>';
  }
  if (!$('#mindmap').hidden) drawMindmap();
}
$('#map-search').addEventListener('input', renderMap);
$('#codex').addEventListener('click', (e) => {
  const b = e.target.closest('.realm[data-g]');
  if (b) setGroup(b.dataset.g);
});

$('#reading').innerHTML = (D.reading || [])
  .map(
    (r) =>
      `<a class="ticket-link" href="${esc(r.url)}" target="_blank" rel="noopener"><span class="ticket-link__prio ticket-link__prio--${r.priority === 'Cao' ? 'high' : 'low'}">${esc(r.priority)}</span><span class="ticket-link__body"><strong>${esc(r.title)}</strong><span>${esc(r.why)}</span></span><span class="ticket-link__go" aria-hidden="true">↗</span></a>`,
  )
  .join('');

/* ---------- mindmap ---------- */

let mm = null;
let mmLevel = 1;
function mmData(level) {
  const node = (content, children = [], depth = 0) => ({ content, children, payload: { fold: children.length && depth >= level ? 1 : 0 } });
  const bulletNodes = (items, depth) => items.map((b) => node(md(b.text), bulletNodes(b.children, depth + 1), depth));
  const serviceNode = (s, depth) =>
    node(
      `<strong>${md(s.heading)}</strong>${s.freq ? ` <span class="mm-freq">${s.freq}</span>` : ''}${s.one_liner || s.what ? `<br><span class="mm-sub">${md(s.one_liner || s.what)}</span>` : ''}`,
      s.parts.map((p) => node(`<span class="mm-part">${esc(p.label)}</span>`, bulletNodes(p.items, depth + 2), depth + 1)),
      depth,
    );
  const groupNode = (g, depth) => node(`<strong>${g.id} · ${esc(splitTitle(g.title)[0])}</strong>`, g.services.map((s) => serviceNode(s, depth + 1)), depth);
  if (group === 'all') return node('<strong>AWS SAA-C03</strong>', D.groups.map((g) => groupNode(g, 1)), 0);
  return groupNode(groupById.get(group), 0);
}
function drawMindmap(level) {
  const lib = window.markmap;
  if (!lib?.Markmap) {
    needMarkmap().then(
      () => drawMindmap(level),
      () => ($('.frame--map').innerHTML = '<p class="empty">Không tải được thư viện mindmap. Các chế độ khác vẫn dùng được.</p>'),
    );
    return;
  }
  // Levels count from the root; a single group is one level shallower than "all".
  if (level != null) mmLevel = level;
  const data = mmData(group === 'all' || mmLevel === 99 ? mmLevel : mmLevel - 1);
  // Branch colours follow the knowledge group of the top-level branch.
  const color = (n) => {
    const top = Number(String(n.state?.path || '').split('.')[group === 'all' ? 1 : 0]);
    return group === 'all' ? PALETTE[(top - 1 + PALETTE.length) % PALETTE.length] || 'var(--red)' : groupColor(group);
  };
  if (!mm) mm = lib.Markmap.create('#mm', { maxWidth: 340, duration: reduced ? 0 : 300, spacingVertical: 6, spacingHorizontal: 60, paddingX: 10, color }, data);
  else {
    mm.setOptions({ color });
    mm.setData(data).then(() => mm.fit());
  }
}
$('#mm-toggle').addEventListener('click', (e) => {
  const open = $('#mindmap').hidden;
  $('#mindmap').hidden = !open;
  e.currentTarget.setAttribute('aria-expanded', String(open));
  if (open) drawMindmap();
});
$('#mindmap').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mm]');
  if (!b) return;
  if (b.dataset.mm === 'fit') mm?.fit();
  else drawMindmap(Number(b.dataset.mm));
});

/* ---------- decision trees ---------- */

let treeId = store.get('tree', D.trees[0]?.id);
let trail = [];
const treesInScope = () => {
  const list = group === 'all' ? D.trees : D.trees.filter((t) => t.group === group);
  return list.length ? list : D.trees;
};
function renderTrees() {
  const list = treesInScope();
  if (!list.some((t) => t.id === treeId)) {
    treeId = list[0]?.id;
    trail = [];
  }
  $('#tree-list').innerHTML = list
    .map(
      (t) =>
        `<li><button type="button" class="quest" data-t="${t.id}" aria-current="${t.id === treeId}" style="--c: ${groupColor(t.group)}">${icon(t.group, 'quest__icon')}<span class="quest__title">${esc(t.title)}</span></button></li>`,
    )
    .join('');
  renderWalker();
}
$('#tree-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-t]');
  if (!b) return;
  treeId = b.dataset.t;
  store.set('tree', treeId);
  trail = [];
  renderTrees();
  if (matchMedia('(max-width: 860px)').matches) $('#walker').scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
});

// Types the text of an element out, a few characters per frame, finishing in about half a second.
// Markup inside (code, bold) is kept because only text nodes are filled in.
function typewrite(el) {
  if (reduced || !el) return;
  const parts = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) parts.push([walker.currentNode, walker.currentNode.data]);
  const total = parts.reduce((n, [, t]) => n + t.length, 0);
  const step = Math.max(1, Math.ceil(total / 32));
  for (const [node] of parts) node.data = '';
  el.classList.add('is-typing');
  let shown = 0;
  const finish = () => {
    for (const [node, text] of parts) node.data = text;
    el.classList.remove('is-typing');
    shown = total;
  };
  el.addEventListener('click', finish, { once: true });
  const tick = () => {
    if (shown >= total || !el.isConnected) return;
    shown += step;
    let left = shown;
    for (const [node, text] of parts) {
      node.data = text.slice(0, Math.max(0, left));
      left -= text.length;
    }
    if (shown >= total) finish();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderWalker() {
  const t = D.trees.find((x) => x.id === treeId);
  const el = $('#walker');
  if (!t) {
    el.innerHTML = '<p class="empty">Chưa có cây quyết định.</p>';
    return;
  }
  let node = t.root;
  const crumbs = [];
  for (const i of trail) {
    crumbs.push(node.options[i].label);
    node = node.options[i].node;
  }
  const back = trail.length ? '<button type="button" class="btn btn--sm" data-act="back">← Lùi một bước</button>' : '';
  const body = node.answer
    ? `<div class="treasure">
        <span class="treasure__stamp" aria-hidden="true">正解</span>
        <p class="treasure__label">Đáp án</p>
        <h3 class="treasure__answer">${md(node.answer)}</h3>
        <p class="treasure__why">${md(node.why || '')}</p>
      </div>
      <div class="walker__actions">${back}<button type="button" class="btn btn--sm btn--red" data-act="restart">Làm lại từ đầu</button></div>`
    : `<div class="dialog">
        <p class="dialog__speaker">${icon(t.group)}Câu ${trail.length + 1}</p>
        <p class="dialog__q">${md(node.q)}</p>
        <span class="dialog__caret" aria-hidden="true"></span>
      </div>
      <ol class="choices">${node.options.map((o, i) => `<li style="--i: ${i}"><button type="button" class="choice" data-o="${i}"><kbd>${i + 1}</kbd><span>${md(o.label)}</span></button></li>`).join('')}</ol>
      ${back ? `<div class="walker__actions">${back}</div>` : ''}`;
  el.innerHTML = `<header class="walker__head" style="--c: ${groupColor(t.group)}"><p class="walker__group">${t.group} · ${esc(groupTitle(t.group))}</p><h3 class="walker__title">${esc(t.title)}</h3><p class="walker__prompt">${md(t.prompt)}</p></header>
    ${crumbs.length ? `<ol class="trail">${crumbs.map((c) => `<li>${md(c)}</li>`).join('')}</ol>` : ''}
    ${body}
    <details class="outline"><summary>Xem toàn bộ cây</summary>${outline(t.root)}</details>`;
  typewrite($('.dialog__q', el));
}
function outline(node) {
  if (node.answer) return `<span class="outline__leaf">${md(node.answer)}</span>`;
  return `<ul class="outline__tree"><li><span class="outline__q">${md(node.q)}</span><ul>${node.options.map((o) => `<li><span class="outline__opt">${md(o.label)} →</span> ${outline(o.node)}</li>`).join('')}</ul></li></ul>`;
}
function walk(act) {
  if (typeof act === 'number') {
    const tree = D.trees.find((x) => x.id === treeId);
    if (!tree) return;
    let node = tree.root;
    for (const i of trail) node = node.options[i].node;
    if (!node.options?.[act]) return;
    trail.push(act);
  } else if (act === 'back') trail.pop();
  else if (act === 'restart') trail = [];
  renderWalker();
}
$('#walker').addEventListener('click', (e) => {
  const o = e.target.closest('[data-o]');
  const a = e.target.closest('[data-act]');
  if (o) walk(Number(o.dataset.o));
  else if (a) walk(a.dataset.act);
});

/* ---------- A vs B ---------- */

const VS_CATEGORY_GROUP = {
  'Compute & scaling': ['02', '03'],
  Storage: ['04'],
  Database: ['05'],
  'Networking & connectivity': ['06'],
  'Messaging & integration': ['07'],
  'Security & identity': ['01', '08'],
  'Monitoring & governance': ['09', '13'],
  'Analytics & ML': ['10', '11'],
  'Migration & DR': ['12'],
};
const TRAP_GROUP = {
  Storage: ['04'],
  Database: ['05'],
  'Compute & scaling': ['02', '03'],
  Networking: ['06'],
  'Security & identity': ['01', '08'],
  'Integration & serverless': ['03', '07'],
};
const VS_ROWS = [
  ['use_when', 'Dùng khi'],
  ['decisive_difference', 'Điểm phân biệt'],
  ['limits', 'Giới hạn / chi phí'],
];

// Every service in the comparison gets its own column; rows line up across columns (subgrid).
const SIDE_COLORS = ['var(--red)', 'var(--navy)', 'var(--green)', '#c98612', '#7a5ea8'];
function pairCard(c, quiz) {
  const hide = (html) => (quiz ? `<button type="button" class="cover" aria-label="Bấm để lật">${html}</button>` : html);
  const rows = VS_ROWS.filter(([k]) => c.rows[k]);
  const side = (col, i) => `<div class="duel__side" style="--side: ${SIDE_COLORS[i % SIDE_COLORS.length]}; grid-row: span ${rows.length + 1}">
      <h4 class="duel__name">${md(col)}</h4>
      ${rows
        .map(([k, label]) => `<div class="duel__row${k === 'decisive_difference' ? ' duel__row--key' : ''}"><p class="duel__label">${label}</p><div>${k === 'decisive_difference' ? hide(md(c.rows[k][i])) : md(c.rows[k][i])}</div></div>`)
        .join('')}
    </div>`;
  const n = c.columns.length;
  return `<article class="duel${n > 2 ? ' duel--wide' : ''}" style="--n: ${n}">
    <p class="duel__cat">${esc(c.category)}<span class="mini-tag">${n} lựa chọn</span></p>
    <h3 class="duel__title">${md(c.heading)}</h3>
    <div class="duel__scroll"><div class="duel__arena">${c.columns.map(side).join('')}${n === 2 ? '<span class="duel__vs" aria-hidden="true">VS</span>' : ''}</div></div>
    ${c.mnemonic ? `<p class="duel__tip"><span class="duel__tip-label">Mẹo nhớ</span>${hide(md(c.mnemonic))}</p>` : ''}
  </article>`;
}

function renderVs() {
  const q = $('#vs-search').value.trim().toLowerCase();
  const quiz = $('#vs-quiz').checked;
  const inGroup = (map, key) => group === 'all' || (map[key] || []).includes(group);
  const pairs = D.confusable.filter((c) => inGroup(VS_CATEGORY_GROUP, c.category) && (!q || JSON.stringify(c).toLowerCase().includes(q)));
  $('#pairs').innerHTML = pairs.length ? pairs.map((c) => pairCard(c, quiz)).join('') : '<p class="empty">Không có cặp nào khớp.</p>';
  const compares = group === 'all' ? [] : groupById.get(group).compare;
  $('#group-compare').innerHTML = compares.length
    ? `<h2 class="subhead"><span class="tile tile--navy tile--xs">比</span>So sánh nhanh trong nhóm</h2><div class="compare-list">${compares
        .map(
          (t) =>
            `<article class="compare"><h3 class="compare__title">${md(t.title)}</h3><div class="table-scroll"><table><thead><tr>${t.rows[0].map((h) => `<th>${md(h)}</th>`).join('')}</tr></thead><tbody>${t.rows
              .slice(1)
              .map((r) => `<tr>${r.map((v, i) => (i ? `<td>${md(v)}</td>` : `<th>${md(v)}</th>`)).join('')}</tr>`)
              .join('')}</tbody></table></div></article>`,
        )
        .join('')}</div>`
    : '';
  const traps = D.traps
    .filter((t) => inGroup(TRAP_GROUP, t.topic))
    .map((t) => [t, t.items.filter((i) => !q || i.toLowerCase().includes(q))])
    .filter(([, items]) => items.length);
  $('#traps').innerHTML = traps.length
    ? traps.map(([t, items]) => `<section class="trap"><h3 class="trap__title">${esc(t.topic)}</h3><ul>${items.map((i) => `<li>${md(i)}</li>`).join('')}</ul></section>`).join('')
    : '<p class="empty">Không có bẫy nào khớp.</p>';
}
$('#vs-search').addEventListener('input', renderVs);
$('#vs-quiz').addEventListener('change', renderVs);
$('#view-vs').addEventListener('click', (e) => {
  const c = e.target.closest('.cover');
  if (c) c.classList.add('is-open');
});

/* ---------- flashcards: Leitner boxes ---------- */

const INTERVALS = [0, 1, 3, 7, 14, 30, 60]; // days per box
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const srs = store.get('srs', {}); // id → [box, dueDay, updatedAt]
let newSeen = store.get('newSeen', { day: 0, n: 0 });
let current = null;
let revealed = false;
$('#new-limit').value = store.get('newLimit', '20');

const cardsInScope = () => {
  const kind = $('#deck-kind').value;
  return D.cards.filter((c) => (kind === 'all' || c.kind === kind) && (group === 'all' || c.group === group));
};
function dueList() {
  const t = today();
  const scope = cardsInScope();
  const due = scope.filter((c) => srs[c.id] && srs[c.id][1] <= t).sort((a, b) => srs[a.id][1] - srs[b.id][1]);
  if (newSeen.day !== t) newSeen = { day: t, n: 0 };
  const room = Math.max(0, Number($('#new-limit').value) - newSeen.n);
  const fresh = scope.filter((c) => !srs[c.id]).slice(0, room);
  return { due, fresh };
}
// Due cards first (oldest first), then new ones; the card just graded waits behind the others.
function nextCard(lastId) {
  const { due, fresh } = dueList();
  const queue = [...due, ...fresh];
  current = queue.find((c) => c.id !== lastId) || queue[0] || null;
  revealed = false;
}
const front = (c) => (c.kind === 'fact' ? md(c.front).replace(/<strong>.*?<\/strong>/g, '<span class="blank">?</span>') : md(c.front));
const back = (c) => (c.kind === 'fact' ? md(c.back).replace(/<strong>(.*?)<\/strong>/g, '<span class="filled">$1</span>') : md(c.back));
const KIND_LABEL = {
  signal: 'Tín hiệu đề → chọn gì?',
  keyword: 'Keyword trong đề → lựa chọn thắng?',
  fact: 'Điền chỗ trống',
  vs: 'Phân biệt',
  trap: 'Bẫy: vì sao sai?',
  pattern: 'Luồng kiến trúc của pattern?',
};
const hardDays = (st) => Math.max(1, Math.round(INTERVALS[st?.[0] ?? 0] / 2));
const dayLabel = (d) => (d >= 30 ? Math.round(d / 30) + ' tháng' : d + ' ngày');

function renderCards({ deal = false } = {}) {
  // The card is always drawn face down, so the reveal state starts over with it.
  revealed = false;
  if (!current || !cardsInScope().some((c) => c.id === current.id)) nextCard();
  const stage = $('#card-stage');
  const { due, fresh } = dueList();
  if (!current) {
    stage.innerHTML = `<div class="flash flash--done"><div class="flash__face"><span class="flash__seal" aria-hidden="true">完</span><h3>Xong phần hôm nay</h3><p>Không còn thẻ đến hạn trong phạm vi đang chọn. Quay lại vào ngày mai, tăng số thẻ mới mỗi ngày hoặc chọn nhóm khác.</p></div></div>`;
  } else {
    const c = current;
    const st = srs[c.id];
    const box = st?.[0] ?? 0;
    const meta = `<p class="flash__meta"><span class="flash__kind">${KIND_LABEL[c.kind]}</span><span>${esc(groupTitle(c.group))}${c.note && c.kind === 'signal' ? ' · ' + esc(c.note) : ''}</span></p>`;
    stage.innerHTML = `
      <p class="deck-count"><span><b>${due.length}</b> đến hạn</span><span><b>${fresh.length}</b> thẻ mới</span><span>${st ? `thẻ này ở hộp ${box}` : 'thẻ chưa học'}</span></p>
      <div class="flash${deal && !reduced ? ' is-dealt' : ''}" style="--c: ${groupColor(c.group)}">
        <div class="flash__inner">
          <div class="flash__face flash__front">${meta}<div class="flash__text">${front(c)}</div><button type="button" class="btn btn--red flash__flip" data-reveal>Lật thẻ</button></div>
          <div class="flash__face flash__back" aria-hidden="true">${meta}<div class="flash__recap">${front(c)}</div><div class="flash__text">${back(c)}</div>${c.note && c.kind !== 'signal' ? `<p class="flash__note">${md(c.note)}</p>` : ''}</div>
        </div>
      </div>
      <div class="grades" hidden>
        <button type="button" class="grade grade--1" data-grade="1">Quên<small>ôn lại ngay</small></button>
        <button type="button" class="grade grade--2" data-grade="2">Khó<small>${dayLabel(hardDays(st))}</small></button>
        <button type="button" class="grade grade--3" data-grade="3">Nhớ<small>${dayLabel(INTERVALS[Math.min(box + 1, 6)])}</small></button>
        <button type="button" class="grade grade--4" data-grade="4">Dễ<small>${dayLabel(INTERVALS[Math.min(box + 2, 6)])}</small></button>
      </div>`;
  }
  renderProgress();
  renderStatus();
}
function reveal() {
  const card = $('#card-stage .flash:not(.flash--done)');
  if (!card || revealed) return;
  revealed = true;
  card.classList.add('is-flipped');
  $('.flash__front', card).setAttribute('aria-hidden', 'true');
  $('.flash__back', card).removeAttribute('aria-hidden');
  $('#card-stage .grades').hidden = false;
  $('#card-stage .grade--3').focus({ preventScroll: true });
}
function grade(g) {
  const c = current;
  if (!c || !revealed) return;
  const prev = srs[c.id];
  if (!prev) newSeen.n += 1;
  const box = prev?.[0] ?? 0;
  const t = today();
  let next;
  if (g === 1) next = [1, t, Date.now()];
  else if (g === 2) next = [Math.max(1, box), t + hardDays(prev), Date.now()];
  else {
    const nb = Math.min(box + (g === 3 ? 1 : 2), 6);
    next = [nb, t + INTERVALS[nb], Date.now()];
  }
  srs[c.id] = next;
  store.set('srs', srs);
  store.set('newSeen', newSeen);
  nextCard(c.id);
  renderCards({ deal: true });
}
$('#card-stage').addEventListener('click', (e) => {
  if (e.target.closest('[data-reveal]')) reveal();
  const g = e.target.closest('[data-grade]');
  if (g) grade(Number(g.dataset.grade));
});
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  // Leave Space/Enter to whatever control has focus outside the card and the dialogue
  // (the mode tabs are fine: activating the open tab again does nothing).
  if (e.target.closest('button, a, summary') && !e.target.closest('#card-stage, #walker, .modes')) return;
  if (view === 'cards') {
    if (e.key === ' ' && current && !revealed) {
      e.preventDefault();
      reveal();
    } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) grade(Number(e.key));
  } else if (view === 'trees' && !e.target.closest('.modes')) {
    if (/^[1-9]$/.test(e.key)) walk(Number(e.key) - 1);
    else if (e.key === 'Backspace' && trail.length) {
      e.preventDefault();
      walk('back');
    }
  }
});
$('#deck-kind').addEventListener('change', () => {
  current = null;
  renderCards();
});
$('#new-limit').addEventListener('change', () => {
  store.set('newLimit', $('#new-limit').value);
  current = null;
  renderCards();
});

function renderProgress() {
  const ids = ['all', ...GROUP_IDS, 'kw', 'traps', 'vs', 'patterns'];
  const pick = (id) => (id === 'all' ? D.cards : id === 'kw' ? D.cards.filter((c) => c.group.startsWith('kw-')) : D.cards.filter((c) => c.group === id));
  $('#progress').innerHTML = ids
    .map((id) => {
      const cs = pick(id);
      const learned = cs.filter((c) => srs[c.id]).length;
      const mastered = cs.filter((c) => srs[c.id]?.[0] >= 4).length;
      const name = id === 'all' ? 'Tất cả' : id === 'kw' ? 'Keyword đề' : groupTitle(id);
      const ic = groupById.has(id) ? id : id === 'all' ? 'book' : 'trophy';
      return `<div class="xp" style="--c: ${groupColor(id)}">
        ${icon(ic, 'xp__icon')}
        <div class="xp__body"><p class="xp__row"><span>${groupById.has(id) ? id + ' · ' : ''}${esc(name)}</span><span>${learned}/${cs.length}</span></p>
        <div class="xp__bar" title="Xanh lá: đã thuộc (hộp ≥ 4) · Vàng: đang học"><i class="xp__m" style="width: ${(mastered / cs.length) * 100}%"></i><i class="xp__l" style="width: ${((learned - mastered) / cs.length) * 100}%"></i></div></div>
      </div>`;
    })
    .join('');
}
function renderStatus() {
  const t = today();
  const due = D.cards.filter((c) => srs[c.id] && srs[c.id][1] <= t).length;
  const learned = Object.keys(srs).length;
  const mastered = Object.values(srs).filter((s) => s[0] >= 4).length;
  const total = D.cards.length;
  const row = (label, ja, value, max, cls) =>
    `<div class="status__row"><span class="status__label">${label}<small lang="ja">${ja}</small></span><span class="status__bar status__bar--${cls}"><i style="width: ${max ? (value / max) * 100 : 0}%"></i></span><span class="status__value">${num(value)}${max ? `<small>/${num(max)}</small>` : ''}</span></div>`;
  $('[data-status]').innerHTML =
    row('Đến hạn', '今日', due, learned, 'due') + row('Đã học', '学習', learned, total, 'learn') + row('Đã thuộc', '習得', mastered, total, 'master');
  const badge = $('[data-due]');
  badge.hidden = !due;
  badge.textContent = due;
}

/* ---------- numbers ---------- */

function renderFacts() {
  const q = $('#facts-search').value.trim().toLowerCase();
  const groups = D.groups.filter((g) => group === 'all' || g.id === group);
  const html = groups
    .map((g) => {
      const items = g.checklist.filter((i) => !q || i.toLowerCase().includes(q));
      return items.length
        ? `<section class="scroll" style="--c: ${groupColor(g.id)}"><h3 class="scroll__title">${icon(g.id)}<span>${g.id}</span>${esc(splitTitle(g.title)[0])}</h3>${splitTitle(g.title)[1] ? `<p class="scroll__sub">${esc(splitTitle(g.title)[1])}</p>` : ''}<ol>${items.map((i) => `<li>${md(i)}</li>`).join('')}</ol></section>`
        : '';
    })
    .join('');
  $('#facts').innerHTML = html || '<p class="empty">Không có mục nào khớp.</p>';
  const covered = $('#facts-cover').checked;
  $('#facts').classList.toggle('is-covered', covered);
  if (covered)
    for (const el of $('#facts').querySelectorAll('strong')) {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Bấm để xem số liệu');
    }
}
$('#facts-search').addEventListener('input', renderFacts);
$('#facts-cover').addEventListener('change', renderFacts);
const toggleFact = (s) => {
  s.classList.toggle('is-shown');
  s.toggleAttribute('aria-label', !s.classList.contains('is-shown'));
};
$('#facts').addEventListener('click', (e) => {
  const s = e.target.closest('.is-covered strong');
  if (s) toggleFact(s);
});
$('#facts').addEventListener('keydown', (e) => {
  const s = e.target.closest('.is-covered strong');
  if (s && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    toggleFact(s);
  }
});

/* ---------- service link graph ---------- */

const G = D.graph;
const NODE = new Map(G.nodes.map((n) => [n.key, n]));
const shortName = (k) => (NODE.get(k)?.name || k).replace(/^(Amazon|AWS)\s+/, '');
const serviceIcon = (k) => `${SERVICE_ICONS}${k}.png`;

// A codex section shows the icon of the service its title names ("EC2 Purchasing Options" → EC2);
// concept sections ("Encryption 101") fall back to their group's icon. Longest name wins.
const plain = (t) => ` ${t.toLowerCase().replace(/^(amazon|aws)\s+/, '').replace(/[^a-z0-9@.]+/g, ' ').trim()} `;
const NODE_NAMES = G.nodes
  .flatMap((n) => [
    [plain(n.name), n.key],
    [plain(n.key.replace(/^amazon-/, '').replace(/-/g, ' ')), n.key],
  ])
  // Short names and abbreviations used in section titles, plus services that have no graph node.
  .concat(
    [
      ['elb', 'elastic-load-balancing'],
      ['classic load balancer', 'elastic-load-balancing'],
      ['ssm parameter store', 'systems-manager-parameter-store'],
      ['elastic ip', 'amazon-ec2'],
      ['eni', 'amazon-ec2'],
      ['beanstalk', 'elastic-beanstalk'],
      ['iot', 'iot-core'],
      ['lex', 'amazon-lex'],
      ['connect', 'amazon-connect'],
      ['outposts', 'outposts'],
      ['device farm', 'device-farm'],
    ].map(([name, key]) => [plain(name), key]),
  )
  .filter(([name]) => name.trim().length > 1)
  .sort((a, b) => b[0].length - a[0].length);
const SECTION_ICON = new Map();
function sectionIcon(s) {
  if (!SECTION_ICON.has(s.id)) {
    const title = plain(splitTitle(s.heading)[0]);
    const hit = NODE_NAMES.find(([name]) => title.includes(name));
    SECTION_ICON.set(s.id, hit ? serviceIcon(hit[1]) : `${ICONS}${s.id.slice(0, 2)}.png`);
  }
  return SECTION_ICON.get(s.id);
}
const nodeFill = (k) => groupColor(NODE.get(k)?.group);
const PROBLEMS_OF = new Map();
// Edges and problems live in graph.json, loaded with d3 the first time the link view opens.
const needGraph = () =>
  (graphReady ??= Promise.all([
    needD3(),
    fetch('/lab/aws-saa/graph.json').then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    }),
  ]).then(([, more]) => {
    Object.assign(G, more);
    for (const p of G.problems) for (const k of p.services) PROBLEMS_OF.set(k, [...(PROBLEMS_OF.get(k) || []), p]);
  }));
const KIND_ORDER = { recipe: 0, architecture: 1, pattern: 2, keyword: 3 };
const KIND_NAME = { recipe: 'Công thức', architecture: 'Kiến trúc', pattern: 'Pattern', keyword: 'Keyword đề' };
const DOMAIN_NAME = { secure: 'Bảo mật', resilient: 'Resilient', performance: 'Hiệu năng', cost: 'Chi phí' };
let linkSel = { node: null, problem: null, back: null };

$('#link-names').innerHTML = G.nodes.map((n) => `<option value="${esc(n.name)}"></option>`).join('');
const findNode = (raw, exactOnly) => {
  const q = raw.trim().toLowerCase();
  if (!q) return null;
  const exact = G.nodes.find((x) => x.name.toLowerCase() === q || shortName(x.key).toLowerCase() === q || x.key === q);
  if (exact || exactOnly) return exact;
  return G.nodes.find((x) => x.name.toLowerCase().includes(q) || x.key.includes(q));
};
$('#link-search').addEventListener('input', (e) => {
  const n = findNode(e.target.value, true);
  if (n) selectNode(n.key);
});
$('#link-search').addEventListener('change', (e) => {
  const n = findNode(e.target.value, false);
  if (n) selectNode(n.key);
});
for (const id of ['lt-flow', 'lt-with', 'lt-confusable', 'link-min']) $('#' + id).addEventListener('change', renderLinks);
$('#link-reset').addEventListener('click', () => {
  linkSel = { node: null, problem: null, back: null };
  renderLinks();
});
const enabledTypes = () => ['flow', 'with', 'confusable'].filter((t) => $('#lt-' + t).checked);
function selectNode(key) {
  linkSel = { node: key, problem: null, back: null };
  renderLinks();
}
function selectProblem(id) {
  linkSel = { node: null, problem: G.problems.find((p) => p.id === id), back: linkSel.node || linkSel.back };
  renderLinks();
}

function renderLinks() {
  if (!window.d3 || !G.edges) {
    $('#link-panel').innerHTML = '<p class="panel__muted">Đang tải bản đồ liên kết…</p>';
    needGraph().then(renderLinks, () => {
      $('.frame--graph').innerHTML = '<p class="empty">Không tải được bản đồ liên kết. Kiểm tra mạng rồi tải lại trang.</p>';
      $('#link-panel').innerHTML = '';
    });
    return;
  }
  const types = enabledTypes();
  const minN = Number($('#link-min').value);
  let nodes, edges, layout;
  if (linkSel.problem) {
    const p = linkSel.problem;
    const order = p.steps ? [...new Set(p.steps.map((s) => s.service))] : p.services;
    nodes = order;
    edges = order.slice(1).map((b, i) => ({ a: order[i], b, type: 'flow', n: 1 }));
    layout = 'chain';
  } else if (linkSel.node) {
    const c = linkSel.node;
    edges = G.edges.filter((e) => types.includes(e.type) && (e.a === c || e.b === c));
    nodes = [c, ...new Set(edges.map((e) => (e.a === c ? e.b : e.a)))];
    const set = new Set(nodes);
    edges = [...edges, ...G.edges.filter((e) => types.includes(e.type) && e.a !== c && e.b !== c && set.has(e.a) && set.has(e.b) && e.n >= Math.max(minN, 3))];
    layout = 'ego';
  } else {
    edges = G.edges.filter((e) => types.includes(e.type) && e.n >= minN);
    if (group !== 'all') {
      const inGroup = (k) => NODE.get(k)?.group === group;
      edges = edges.filter((e) => inGroup(e.a) || inGroup(e.b));
    }
    nodes = [...new Set(edges.flatMap((e) => [e.a, e.b]))];
    layout = 'overview';
  }
  drawGraph(nodes, edges, layout);
  renderPanel();
}

function drawGraph(keys, edgeList, layout) {
  const d3 = window.d3;
  const svg = d3.select('#graph');
  svg.selectAll('*').remove();
  const { width, height } = svg.node().getBoundingClientRect();
  const deg = new Map();
  for (const e of edgeList) for (const k of [e.a, e.b]) deg.set(k, (deg.get(k) || 0) + e.n);
  // Node sizes snap to whole 2px steps so the squares stay crisp.
  // Each node is an icon tile at least 24px wide, so the service art stays readable.
  const nodes = keys.map((key) => ({ key, r: 2 * Math.round(Math.min(22, 12 + 1.6 * Math.sqrt(deg.get(key) || 1)) / 2) }));
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const links = edgeList.filter((e) => byKey.has(e.a) && byKey.has(e.b)).map((e) => ({ ...e, source: e.a, target: e.b }));
  const center = linkSel.node;
  if (layout === 'chain') {
    const perRow = Math.max(2, Math.floor((width || 800) / 190));
    nodes.forEach((n, i) => {
      const row = Math.floor(i / perRow);
      const col = row % 2 ? perRow - 1 - (i % perRow) : i % perRow;
      n.x = n.fx = col * 190;
      n.y = n.fy = row * 130 + (i % 2 ? 24 : -24);
      n.r = 16;
    });
  } else if (layout === 'overview') {
    // Each knowledge group gets its own region so the map reads as clusters, not one tangle.
    const R = Math.max(260, nodes.length * 3.2);
    for (const n of nodes) {
      const gi = GROUP_IDS.indexOf(NODE.get(n.key)?.group);
      const a = (gi < 0 ? 0 : gi / GROUP_IDS.length) * 2 * Math.PI;
      n.gx = Math.cos(a) * R;
      n.gy = Math.sin(a) * R;
      n.x = n.gx + (Math.random() - 0.5) * 40;
      n.y = n.gy + (Math.random() - 0.5) * 40;
    }
  } else if (center && byKey.has(center)) {
    byKey.get(center).fx = 0;
    byKey.get(center).fy = 0;
  }
  const sim = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.key)
        .distance((l) => (layout === 'ego' ? 150 : l.type === 'confusable' ? 90 : 70))
        .strength(layout === 'ego' ? 0.15 : layout === 'overview' ? 0.04 : 0.35),
    )
    .force('charge', d3.forceManyBody().strength(layout === 'ego' ? -420 : -170))
    .force('collide', d3.forceCollide((d) => d.r + 16))
    .force('x', d3.forceX((d) => d.gx ?? 0).strength(layout === 'overview' ? 0.35 : 0.06))
    .force('y', d3.forceY((d) => d.gy ?? 0).strength(layout === 'overview' ? 0.35 : 0.06))
    .stop();
  for (let i = 0; i < 320; i++) sim.tick();

  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerUnits', 'userSpaceOnUse')
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M0,0 L10,5 L0,10 z')
    .attr('class', 'arrow-head');
  const root = svg.append('g');
  const zoomer = d3
    .zoom()
    .scaleExtent([0.15, 4])
    .on('zoom', (ev) => root.attr('transform', ev.transform));
  svg.call(zoomer).on('dblclick.zoom', null);

  const edgeSel = root
    .append('g')
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('class', (d) => 'edge edge--' + d.type)
    .attr('stroke-width', (d) => 1 + Math.log2(d.n + 1))
    .attr('marker-end', (d) => (d.type === 'flow' ? 'url(#arrow)' : null))
    .attr('d', (d) => {
      // Stop the line at the edge of the target square so the arrow head stays visible.
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const len = Math.hypot(dx, dy) || 1;
      const stop = (d.target.r * len) / (Math.max(Math.abs(dx), Math.abs(dy)) || 1) + 3;
      return `M${d.source.x},${d.source.y}L${d.target.x - (dx / len) * stop},${d.target.y - (dy / len) * stop}`;
    });
  edgeSel.append('title').text((d) => `${shortName(d.a)} ${d.type === 'flow' ? '→' : d.type === 'with' ? '+' : '≠'} ${shortName(d.b)} · ${d.n} lần`);

  const showLabel = (d) => layout !== 'overview' || d.r >= 10 || nodes.length < 45;
  const nodeSel = root
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', (d) => 'node' + (d.key === center ? ' node--center' : ''))
    .attr('transform', (d) => `translate(${d.x},${d.y})`)
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => NODE.get(d.key)?.name || d.key);
  // A pixel tile: hard drop shadow, a cream square with an ink border, a group-coloured base and the service icon.
  nodeSel
    .append('rect')
    .attr('class', 'node__shadow')
    .attr('x', (d) => -d.r + 3)
    .attr('y', (d) => -d.r + 3)
    .attr('width', (d) => d.r * 2)
    .attr('height', (d) => d.r * 2);
  nodeSel
    .append('rect')
    .attr('class', 'node__block')
    .attr('x', (d) => -d.r)
    .attr('y', (d) => -d.r)
    .attr('width', (d) => d.r * 2)
    .attr('height', (d) => d.r * 2);
  nodeSel
    .append('rect')
    .attr('class', 'node__base')
    .attr('x', (d) => -d.r + 1)
    .attr('y', (d) => d.r - 4)
    .attr('width', (d) => d.r * 2 - 2)
    .attr('height', 3)
    .style('fill', (d) => nodeFill(d.key));
  nodeSel
    .append('image')
    .attr('href', (d) => serviceIcon(d.key))
    .attr('x', (d) => -d.r + 3)
    .attr('y', (d) => -d.r + 2)
    .attr('width', (d) => d.r * 2 - 6)
    .attr('height', (d) => d.r * 2 - 7);
  nodeSel
    .filter(showLabel)
    .append('text')
    .attr('x', (d) => d.r + 6)
    .attr('y', 4)
    .text((d) => shortName(d.key));
  if (layout === 'chain')
    nodeSel
      .append('text')
      .attr('class', 'node__step')
      .attr('text-anchor', 'middle')
      .attr('x', (d) => -d.r)
      .attr('y', (d) => -d.r + 2)
      .text((d, i) => i + 1);
  nodeSel.on('click', (_, d) => selectNode(d.key)).on('keydown', (ev, d) => ev.key === 'Enter' && selectNode(d.key));
  nodeSel
    .on('mouseenter', (_, d) => {
      const near = new Set([d.key]);
      edgeSel.classed('is-near', (e) => {
        const hit = e.a === d.key || e.b === d.key;
        if (hit) near.add(e.a).add(e.b);
        return hit;
      });
      nodeSel.classed('is-near', (n) => near.has(n.key));
      svg.classed('is-hovering', true);
    })
    .on('mouseleave', () => svg.classed('is-hovering', false));

  if (!nodes.length) return;
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 40, Math.max(...xs) + 140, Math.min(...ys) - 40, Math.max(...ys) + 40];
  const k = Math.min(2, 0.95 / Math.max((x1 - x0) / (width || 800), (y1 - y0) / (height || 600)));
  svg.call(zoomer.transform, d3.zoomIdentity.translate((width || 800) / 2 - (k * (x0 + x1)) / 2, (height || 600) / 2 - (k * (y0 + y1)) / 2).scale(k));
  if (!reduced) {
    svg.classed('is-entering', true);
    setTimeout(() => svg.classed('is-entering', false), 700);
  }
}

const svcBtn = (k) =>
  `<button type="button" class="svc-pill" data-node="${k}" style="--c: ${nodeFill(k)}"><img class="svc-pill__icon" src="${serviceIcon(k)}" alt="" width="18" height="18" loading="lazy" />${esc(shortName(k))}</button>`;
const evidenceList = (ev) => `<ul class="evidence">${ev.map((v) => `<li>${md(v.text)}<span>${esc(v.source)}</span></li>`).join('')}</ul>`;
const problemList = (list) =>
  `<ul class="plist">${list.map((p) => `<li><button type="button" data-problem="${p.id}"><span class="kind kind--${p.kind}">${KIND_NAME[p.kind]}</span><span>${md(p.title)}</span></button></li>`).join('')}</ul>`;

function renderPanel() {
  const el = $('#link-panel');
  el.scrollTop = 0;
  if (linkSel.problem) {
    const p = linkSel.problem;
    el.innerHTML = `${linkSel.back ? `<button type="button" class="btn btn--sm" data-node="${linkSel.back}">← ${esc(shortName(linkSel.back))}</button>` : ''}
      <p class="panel__tags"><span class="kind kind--${p.kind}">${KIND_NAME[p.kind]}</span>${p.domain ? `<span class="mini-tag">${esc(DOMAIN_NAME[p.domain] || p.domain)}</span>` : ''}</p>
      <h3 class="panel__title">${md(p.title)}</h3>
      ${p.problem ? `<p class="panel__muted">${md(p.problem.replace(/^\s*-\s*/, '').replace(/\s-\s(?=\S)/g, ' · '))}</p>` : ''}
      ${p.answer ? `<h4>Lựa chọn thắng</h4><p>${md(p.answer)}</p>` : ''}
      ${p.flow ? `<h4>Luồng</h4><p class="flowline">${md(p.flow)}</p>` : ''}
      ${p.steps ? `<h4>Từng bước</h4><ol class="steps">${p.steps.map((s) => `<li>${svcBtn(s.service)} ${md(s.role)}</li>`).join('')}</ol>` : `<h4>Service tham gia</h4><p class="pill-row">${p.services.map(svcBtn).join('')}</p>`}
      ${p.why ? `<h4>Vì sao thắng</h4><p>${md(p.why)}</p>` : ''}
      ${p.alternatives?.length ? `<h4>Phương án hay chọn sai</h4>${p.alternatives.map((a) => `<p class="wrong"><b>✗ ${md(a.option)}</b>: ${md(a.why_wrong)}</p>`).join('')}` : ''}
      ${p.rules?.length ? `<h4>Quy tắc phải nhớ</h4>${p.rules.map((r) => `<p class="rule">${md(r.text)}</p>`).join('')}` : ''}
      <p class="panel__source">Nguồn: ${esc(p.source)}</p>`;
  } else if (linkSel.node) {
    const c = linkSel.node;
    const n = NODE.get(c);
    const g = groupById.get(n?.group);
    const touching = G.edges.filter((e) => e.a === c || e.b === c);
    const together = new Map();
    for (const e of touching.filter((e) => e.type !== 'confusable')) {
      const other = e.a === c ? e.b : e.a;
      const t = together.get(other) || { n: 0, out: 0, inn: 0, with: 0, ev: [] };
      t.n += e.n;
      if (e.type === 'flow') e.a === c ? (t.out += e.n) : (t.inn += e.n);
      else t.with += e.n;
      t.ev.push(...e.evidence);
      together.set(other, t);
    }
    const conf = touching.filter((e) => e.type === 'confusable').sort((a, b) => b.n - a.n);
    const probs = (PROBLEMS_OF.get(c) || []).slice().sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
    const arrow = (t) => [t.out ? '→' : '', t.inn ? '←' : '', t.with ? '+' : ''].join('');
    el.innerHTML = `<p class="panel__tags">${g ? `${icon(g.id)}<span class="mini-tag">${g.id} · ${esc(g.title)}</span>` : ''}</p>
      <h3 class="panel__title">${esc(n?.name || c)}</h3>
      ${n?.summary ? `<p>${md(n.summary)}</p>` : ''}
      <h4>Hay đi cùng (${together.size})</h4>
      <p class="panel__muted">→ gửi tới · ← nhận từ · + dùng cùng nhau. Số bên phải là số lần xuất hiện; mở ra để xem câu gốc.</p>
      ${
        [...together]
          .sort((a, b) => b[1].n - a[1].n)
          .map(([k, t]) => `<details class="rel"><summary><span class="rel__arrow">${arrow(t)}</span>${svcBtn(k)}<span class="rel__n">${t.n}</span></summary>${evidenceList(t.ev.slice(0, 8))}</details>`)
          .join('') || '<p class="panel__muted">Chưa có.</p>'
      }
      <h4>Dễ nhầm với (${conf.length})</h4>
      ${conf.map((e) => `<details class="rel"><summary><span class="rel__arrow">≠</span>${svcBtn(e.a === c ? e.b : e.a)}<span class="rel__n">${e.n}</span></summary>${evidenceList(e.evidence)}</details>`).join('') || '<p class="panel__muted">Chưa có.</p>'}
      <h4>Bài toán dùng service này (${probs.length})</h4>
      ${probs.length ? problemList(probs) : '<p class="panel__muted">Chưa có.</p>'}`;
  } else {
    const recipes = G.problems.filter((p) => p.kind === 'recipe');
    const arch = G.problems.filter((p) => p.kind === 'architecture' || p.kind === 'pattern');
    const byDomain = Object.keys(DOMAIN_NAME)
      .map((d) => [d, recipes.filter((r) => r.domain === d)])
      .filter(([, l]) => l.length);
    el.innerHTML = `<h3 class="panel__title">Bài toán kết hợp</h3>
      <p class="panel__muted">Chọn một bài toán để xem chuỗi service giải nó, hoặc bấm một service trên bản đồ. Đường càng dày thì cặp service càng hay đi cùng nhau.</p>
      ${byDomain.map(([d, l]) => `<h4>${DOMAIN_NAME[d]} (${l.length})</h4>${problemList(l)}`).join('')}
      <h4>Pattern & kiến trúc (${arch.length})</h4>${problemList(arch)}`;
  }
}
$('#link-panel').addEventListener('click', (e) => {
  const nodeBtn = e.target.closest('[data-node]');
  const probBtn = e.target.closest('[data-problem]');
  if (nodeBtn) {
    e.preventDefault();
    selectNode(nodeBtn.dataset.node);
  } else if (probBtn) selectProblem(probBtn.dataset.problem);
});
let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => view === 'links' && renderLinks(), 200);
});

/* ---------- boot ---------- */

renderRealms();
setView(view);
renderStatus();
