# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

The site is [index.html](index.html), [styles.css](styles.css), and [script.js](script.js), plus four
top-level asset folders (`assets/`, `lens-icons/`, `stickers/`, `companion-sprites/` — `assets/`
itself has an `svg/` and a `fonts/` subfolder).
There is no `package.json`, build tool, linter, or test suite — open [index.html](index.html) directly
in a browser (or host it as static files) and it runs entirely client-side.

These three files are **hand-authored, traditional static-site source** — plain HTML/CSS/vanilla JS,
no framework, no build step, no bundler wrapper. (This was not always true: the file used to be a
generated Design Canvas bundle export with an unpacking script, a JSON-escaped template string, and
an embedded React runtime. It was converted to this plain form in 2026-08; if you ever see
`<x-dc>`, `__bundler/*` script tags, or `{{ }}`/`sc-camel-*` template syntax again, that's leftover
from an older export, not the current architecture.)

- [index.html](index.html) — full markup for all 7 sections (hero, make, play, reframe, divergence,
  make-it-matter, footer). Most element styling is inline (`style="..."`), matching each element's
  one-off design — this is intentional, not something to "clean up" into classes.
- [styles.css](styles.css) — only what inline styles can't express: `@font-face` rules, the CSS
  reset, keyframe animations, the responsive media queries, the shared `.gz-tiles`/`.gz-tile`
  magnet-tile rules, and every `:hover` rule (a real `:hover` selector can't live in a `style`
  attribute).
- [script.js](script.js) — all interactivity: the magnet-tile cursor-follow hover effect per
  section, the Make/Play/Reframe/Divergence card flip (click front or "View Services ↻" to flip,
  "↩ Back" to flip back), the left-rail scroll progress indicator, and the scroll-triggered
  fade/slide-in reveal animations. Driven by a `section[data-gz-section]` `IntersectionObserver`
  and plain `addEventListener` calls — no virtual DOM, no reactive re-render; each handler mutates
  the specific elements it owns directly.

## Working with these files

- Edit [index.html](index.html)/[styles.css](styles.css)/[script.js](script.js) directly like any
  normal static site — no extraction/JSON-escaping step needed.
- The 1,200 magnet-tile `<div>`s (20×10 grid × 6 sections) are **not** in the HTML — script.js
  generates them at load (`TILE_CONFIGS` array) and repositions/fades them on `mousemove` via a
  `requestAnimationFrame`-throttled distance calculation. Change tile behavior (radius, colors,
  which icon) in the `TILE_THEMES`/`ICON_SRC`/`TILE_CONFIGS` constants at the top of script.js, not
  in the HTML.
- The card-flip front/back faces use `aria-hidden`, `pointer-events`, and `tabindex` all kept in
  sync by `script.js` on toggle (see the `LENSES.forEach` block) — if you add a 5th flippable card,
  follow that same pattern rather than relying on CSS alone, since the hidden face must also be
  unreachable by keyboard/screen reader.
- To view the site, just open [index.html](index.html) in a browser. No dev server, build step, or
  `DecompressionStream`/`Blob` support required anymore.

## Asset folders

```text
assets/svg/              backgrounds, wordmark, hero/heading graphics, lens mark (SVG only)
assets/fonts/             5 woff2 files backing the @font-face rules in styles.css (Archivo x3 subsets, Archivo Black x2 subsets)
lens-icons/               4 flat files: make-icon.svg, play-icon.svg, reframe-icon.svg, divergence-icon.svg
stickers/svg/             the 4 big lens "stickers": MakeSticker.svg, PlaySticker.svg, ReframeSticker.svg, DivergenceSticker.svg
companion-sprites/svg/   full-body character illustrations for the 4 lens companions: make.svg, play.svg, reframe.svg, divergence.svg
companion-sprites/webp/  raster (webp) versions of the same 4 companions
```

Everything under `assets/`, `lens-icons/`, and `stickers/` is SVG-only — PNG/WebP/EPS/PDF export
variants that existed earlier have been removed. `lens-icons/` has no format subfolder (unlike the
others); its 4 files sit directly in the folder root with kebab-case `-icon.svg` names.
`companion-sprites/` is the one folder with both `svg/` and `webp/` — each companion illustration
viewBox is `0 0 1536 2288` (tall portrait), natural-toned illustrated character art (not flat brand
colors) representing each of the 4 lenses.

Every file in `assets/`, `lens-icons/`, and `stickers/` is referenced from `index.html`:

- `assets/svg/*` — the four per-section `data-gz-bg-letter` backgrounds, lens mark/wordmark/hero/
  heading graphics, the scroll-down indicator, the two "O" separators.
- `assets/fonts/*.woff2` — referenced only from the `@font-face` `src: url(...)` rules at the top of
  [styles.css](styles.css).
- `stickers/svg/*Sticker.svg` — one big sticker per section (the small icon shown next to each
  card's "View Services" button — distinct from the magnet-tile background icon below).
- `lens-icons/*-icon.svg` — the small per-tile icon in each section's magnet-tile background
  effect, via the `ICON_SRC` map near the top of [script.js](script.js).

`companion-sprites/` is **not yet wired into `index.html`** — the 4 companion characters exist as
finished art staged for future use (section art, transitions, onboarding, social content, Easter
eggs) rather than a single fixed placement, so there's no established reference pattern for them
yet. When a use is decided, wire it the same way as the others: a plain relative
`src="companion-sprites/svg/whatever.svg"`.

`companion-sprites/turnarounds/` holds raster (PNG) production reference, not site assets — not
referenced from `index.html` and not meant to be: 4 combined sheets (`t-pose-make.png`,
`t-pose-play.png`, `t-pose-reframe.png`, `t-pose-divergence.png`, despite the filename these are
front/three-quarter/back **turnarounds**, arms at the sides, not a literal T-pose) plus each one
cropped into 3 separate `{name}-front.png` / `{name}-side.png` / `{name}-back.png` files. The
individual crops exist to support a near-term "sprite-swap" idea — showing front/side/back based on
companion movement direction on the site — as a cheaper alternative to full skeletal rigging; a
proper T-pose (arms out, separated/named layers) would still be needed for real bone-based
animation in a tool like Rive.

When adding a new reference to `assets/`, `stickers/`, or `lens-icons/`, match the existing pattern:
a plain relative `src="assets/svg/whatever.svg"` (or `stickers/svg/...`,
`lens-icons/whatever-icon.svg`) — no uuid/manifest involvement needed for files served from disk
this way.
