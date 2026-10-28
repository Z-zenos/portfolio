// Syntax colours for code blocks in blog posts. highlight.js loads only on pages that have code,
// and only with the languages those blocks use. Blocks marked lang-text stay plain.
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es';
const LANGS = { py: 'python', python: 'python', js: 'javascript', ts: 'typescript', glsl: 'glsl', bash: 'bash' };

export async function highlightCode(root = document) {
  const blocks = [...root.querySelectorAll('pre code[class*="lang-"]')]
    .map((el) => ({ el, lang: LANGS[el.className.match(/lang-(\w+)/)[1]] }))
    .filter((b) => b.lang);
  if (!blocks.length) return;

  try {
    const { default: hljs } = await import(`${CDN}/core.min.js`);
    const langs = [...new Set(blocks.map((b) => b.lang))];
    const mods = await Promise.all(langs.map((l) => import(`${CDN}/languages/${l}.min.js`)));
    langs.forEach((l, i) => hljs.registerLanguage(l, mods[i].default));
    for (const { el, lang } of blocks) {
      el.innerHTML = hljs.highlight(el.textContent, { language: lang }).value;
      el.classList.add('hljs');
    }
  } catch {
    // Offline or CDN blocked: the code stays readable without colours.
  }
}
