# Portfolio — project notes

Personal portfolio site. Vanilla JS + CSS + three.js, built with Vite, deployed to GitHub Pages
by `.github/workflows/deploy.yml`. Maintainer docs: `README.md`.

## Rules that govern every word on the page
- First person, professional register, no introspection.
- Nothing a visitor cannot verify. Every claim links to its evidence. Private work is stated
  without a count. Moodle core work is described as unverifiable by design.
- The commit count is whatever the linked GitHub search returns, dated (`src/content/evidence.json`).
- Amber `#ffb000` + neutrals only. No phone, no address. Find-me = GitHub + LinkedIn.
- Graveyard = exactly `navi-agent` and `agenticneturalnetwork`. Other experiments are one-line
  "explored" rows on KNOWLEDGE, no numbers, no links.

## Layout
- `index.html` — chrome and five empty `.screen` shells. Screens are filled at boot by
  `src/render/index.js`, which must run before `src/app.js` (row indexing and redaction happen once at load).
- `src/content/*.json` — all text. Fields ending in `Html` allow only `<b>`, `<u>`,
  `<span class="lit">`, `<span style="color:var(--acc)">` (see `src/render/h.js`).
- `src/app.js` — transition engine, keyboard, reticle, clock, redaction. `src/lattice.js` — WebGL
  backdrop, named three.js imports (namespace import defeats tree-shaking; colour management is
  disabled on purpose to keep the amber identical).
- No fifth screen: `ORDER`, `NAME`, `REGION`, `'/04'` are hardcoded in `app.js`. Add panels, not screens.

## Verification
`scripts/check-links.sh` after `npm run build`. Playwright kit in `~/agents/portfolio/BUILD-PLAN.md` §2:
zero console errors, `scrollWidth` 400 at phone width, keyboard path through all screens, reduced motion instant.

## History
- 2026-09-21 — built from the approved mockup (`~/agents/portfolio/mockups/05-direction-d.html`)
  in 8 tickets (`~/agents/portfolio/BUILD-PLAN.md`). Owner inits git and pushes; agents never do.
- 2026-09-21 — every entry (5 cards + 2 graveyard) opens its own dossier: one renderer (`src/render/projects.js` `dossiers()`) driven by a `dossier` object per entry in `projects.json`; shells generated into the stage by `src/render/index.js` (`data-dossier`/`data-name` feed the `DOSSIER 0N` readout and rail names in `app.js`); repo links moved from cards into the dossier (`.links` control, ↑↓ + Enter); one shared lattice region `dossier`.
- 2026-09-21 — keyboard/touch UX pass: ↑↓ walk every `.tgt` then page-scroll the screen; PageUp/Down, Space, Home, End scroll the live screen from body; focus always lands on the new screen's first target (screens are `tabindex=-1`); Esc clears the highlight, then goes to IDENTITY, never a no-op; navigation asked for mid-transition is kept and played at settle (`intent()`/`pending`); horizontal swipe ≥ 60 px = ← →; `.hint` renders a `.kb` and a `.tc` variant (`hintTouch` in `identity.json`/`projects.json`), swapped by `(hover:none)`; `.cue` bottom fade + ▾ while the screen has more below (`body.more`); every outbound link `_blank noopener`; Dark Eye dossier got its REPOSITORY link.
- 2026-09-21 — fix: the body flag set while a dossier is live is `in-dossier` (was `dossier`, which matched the `.dossier div` grid rules and painted the fixed `.ap` aperture over the stage — dossiers rendered black).
- 2026-09-21 — ←/→ on a highlighted `.tgt` first look for a target on the same row (`beside()` in `app.js`: vertical centre inside the current rect, nearest to the left/right) and move the highlight there; only at the row's edge do they change screen. Single-column layouts are unchanged.
- 2026-09-21 — ↑/↓ on a highlighted `.tgt` are column-aware (`under()` in `app.js`): nearest target below/above whose x-range overlaps the current one, largest overlap first (within 2px = same column, since card rects carry sub-pixel jitter), then smallest vertical distance; falls back to the nearest target in any column, then to the page-scroll. Single-column layouts walk DOM order as before.
