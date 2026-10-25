# Portfolio

A pixel-art RPG-style portfolio with English and Japanese labels. Its layout follows udaykhalsa.dev:
passport-style About, a quest log, a skill tree with filters, featured projects, and a contact section.
The hero is an original Hoi An scene painted by Codex (assets/hero.png): a peach blossom tree, a shrine and a shophouse.
Code adds the live effects: lantern glow, falling peach petals, a rippling river reflection and floating lotus lanterns.
A generative lo-fi player (WebAudio, no audio files) sits in the corner.

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
- `src/main.js`: wiring (typewriter, quest log, skill filters, vitals roll, nav highlight)
- `src/scene.js`: hero effects on top of `assets/hero.png`
- `src/lofi-player.js`: generative lo-fi engine and the radio player UI (prev/next, real audio visualizer, volume, minimize)
- `src/decor.js`: handwritten notes, hanko stamps, tategaki phrases and pixel props
- `src/petals.js`: page-wide falling peach blossom petals
- `assets/player/`, `assets/props/`: player album art and cat, Japanese pixel props (Codex, sliced and keyed)
- `assets/*.png`: faded background decorations generated with Codex, keyed and downscaled; sources are in `assets/raw/`

Fonts: DotGothic16, Press Start 2P and Silkscreen, with VT323 as a fallback. None of the
display fonts has Vietnamese diacritics, so the copy uses English spellings (Vietnam, Hoi An).
Skill icons load from the devicon CDN.
