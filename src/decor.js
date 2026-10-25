// Japanese-style decoration layered over the rendered sections: handwritten notes with
// hand-drawn arrows, hanko stamps, vertical tategaki phrases and small pixel props.
// Everything here is aria-hidden; it never carries content the page depends on.

const ARROWS = {
  // Each arrow points toward its end point; flip classes mirror it.
  left: { d: 'M96 30 C74 14, 44 44, 10 28', head: 'M10 28 L22 20 M10 28 L22 37' },
  down: { d: 'M46 4 C24 20, 70 32, 50 56', head: 'M50 56 L40 47 M50 56 L59 46' },
  diag: { d: 'M94 6 C68 2, 36 14, 14 46', head: 'M14 46 L14 32 M14 46 L28 43' },
};

const note = ({ text, ja, arrow, flip = '', pos }) => {
  const a = ARROWS[arrow];
  return `
    <div class="note note--${pos}" aria-hidden="true">
      <p class="note__text">${text}<span class="note__ja">${ja}</span></p>
      <svg class="note__arrow ${flip}" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="${a.d}" pathLength="1" /><path d="${a.head}" pathLength="1" />
      </svg>
    </div>`;
};

const hanko = (glyph, pos) => `<span class="hanko hanko--${pos}" aria-hidden="true">${glyph}</span>`;

const tategaki = (phrase, gloss, side) =>
  `<p class="tategaki tategaki--${side}" aria-hidden="true">${phrase}<span class="tategaki__gloss">${gloss}</span></p>`;

const prop = (name, pos) => `<img class="prop prop--${pos}" src="assets/props/${name}.png" alt="" aria-hidden="true" />`;

// [container selector, html]
const DECOR = [
  ['.hero__name', note({ text: 'yoroshiku ne!', ja: 'よろしくね', arrow: 'diag', flip: 'flip-y', pos: 'name' })],
  ['.hero', note({ text: 'play some lo-fi ♪', ja: '音楽どうぞ', arrow: 'left', flip: 'flip-x', pos: 'music' })],
  ['.hero', prop('cloud-long', 'cloud-a') + prop('cloud-small', 'cloud-b') + prop('crane', 'crane')],

  ['#about', tategaki('一期一会', 'ichi-go ichi-e · treasure every meeting', 'left') + prop('chime', 'chime')],
  ['.passport', note({ text: 'roll the dice!', ja: '振ってみて', arrow: 'diag', flip: 'flip-x', pos: 'roll' }) + hanko('認可', 'passport')],
  ['.expertise', prop('bonsai', 'bonsai')],

  ['#exp', tategaki('七転び八起き', 'fall seven times, rise eight', 'right')],
  ['.ledger', note({ text: 'pick a quest', ja: 'クエストを選んで', arrow: 'diag', flip: 'flip-x', pos: 'ledger' }) + prop('lantern', 'lantern')],

  ['#work', tategaki('継続は力なり', 'persistence is power', 'right')],
  ['.filters', note({ text: 'sort by class!', ja: '分類', arrow: 'left', pos: 'filters' })],
  ['.project', note({ text: 'my favourite', ja: 'お気に入り', arrow: 'diag', pos: 'project' }) + hanko('推', 'project')],

  ['#contact', tategaki('ご縁を大切に', 'cherish every connection', 'right') + prop('koi', 'koi')],
  ['.transmit', note({ text: 'I reply within a day', ja: 'すぐ返信します', arrow: 'diag', flip: 'flip-x', pos: 'transmit' }) + prop('lucky-cat', 'cat')],
];

export function mountDecor() {
  for (const [selector, html] of DECOR) {
    document.querySelector(selector)?.insertAdjacentHTML('beforeend', html);
  }

  // Notes draw themselves in once they scroll into view.
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-drawn');
        io.unobserve(e.target);
      }),
    { threshold: 0.6 },
  );
  document.querySelectorAll('.note').forEach((n) => io.observe(n));

  // The music hint disappears once the player is running.
  const player = document.querySelector('#player');
  new MutationObserver(() => {
    document.body.classList.toggle('music-on', player.classList.contains('is-playing'));
  }).observe(player, { attributes: true, attributeFilter: ['class'] });
}
