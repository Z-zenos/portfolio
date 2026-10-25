# Portfolio

A pixel-art RPG-style portfolio with English and Japanese labels. Its layout follows udaykhalsa.dev:
passport-style About, a quest log, a skill tree with filters, featured projects, and a contact section.
The hero is an original Hoi An scene painted by Codex (assets/hero.png): a peach blossom tree, a shrine and a shophouse.
Code adds the live effects: lantern glow, falling peach petals, a rippling river reflection and floating lotus lanterns.
A generative lo-fi player (WebAudio, no audio files) sits in the corner.

Small extras:

- Day and night follow the local time in Vietnam. After 18:00 the scene dims under a starry sky with fireflies; the navbar clock switches it by hand.
- Click a lantern to light it up, click the tree to shake petals loose, and move over the river to make ripples.
- Type `tet` or the Konami code (or tap the footer hint) for fireworks and a festive track.
- A short welcome screen plays once per visit (skipped with reduced motion).
- Light and dark themes: follows the system setting until the visitor picks one with the 明/暗 button in the navbar (remembered in localStorage). Colours are CSS variables in `styles.css`; objects with their own material (mahjong tiles, ema plaques, tickets) keep dark ink in both themes.
- Pixel cursors for each kind of target (arrow, pointing hand, text, grab on skill tiles, not-allowed, and a sparkle hand over clickable parts of the scene), defined as `--cur-*` variables.

No build step. ES modules need a local server:

```sh
python3 -m http.server 5173
# open http://localhost:5173
```

## Editing content

All text lives in `src/profile.js` (values marked `EDIT`): name, katakana name, roles,
stats, story, expertise, quests (experience), skills, projects and links.

## Files

- `src/profile.js`: content
- `src/sections.js`: renders each section from the content
- `src/main.js`: wiring (typewriter, quest log, skill filters, vitals roll, nav highlight, day/night clock, welcome screen, Tet easter egg)
- `src/scene.js`: hero effects on top of `assets/hero.png` (night sky, clicks, river ripples, fireworks)
- `src/lofi-player.js`: generative lo-fi engine and the radio player UI (prev/next, real audio visualizer, volume, minimize)
- `src/decor.js`: handwritten notes, hanko stamps, tategaki phrases and pixel props
- `src/petals.js`: page-wide falling peach blossom petals
- `assets/player/`, `assets/props/`: player album art and cat, Japanese pixel props (Codex, sliced and keyed)
- `assets/favicon.svg`: the pixel lantern used as favicon, nav logo and welcome screen; `assets/og.png` is the link preview (a 1200x630 screenshot of the hero)
- `assets/*.png`: faded background decorations generated with Codex, keyed and downscaled; sources are in `assets/raw/`

Fonts: DotGothic16, Press Start 2P and Silkscreen, with VT323 as a fallback. None of the
display fonts has Vietnamese diacritics, so the copy uses English spellings (Vietnam, Hoi An).
Skill icons load from the devicon CDN.
