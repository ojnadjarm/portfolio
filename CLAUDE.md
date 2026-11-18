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
- Hidden gallery (T1031): `gallery/index.html` is a second Vite entry (`vite.config.js` `input`), served at
  `/portfolio/gallery/`, `noindex`, with no link from the main page. Ways in: typing `play` anywhere, or `#play` / `#gallery`
  on the main URL (`src/egg.js`). Hash routes: `#<exhibit id>` shows one exhibit, anything else the index; Esc goes
  exhibit → index → portfolio. Code: `src/gallery.js` + `src/gallery.css`.
- Exhibits: `src/content/gallery.json` `exhibits[]`, rendered by one module, `src/exhibit.js` (+ `src/exhibit.css`), for both
  the gallery and the main-page modal. Media kinds: `embed` (poster + "Load and start", the iframe exists only after
  the click), `video` (`controls muted preload="none"` + poster), `stills` (lazy images). Media paths are relative to the
  site base and live in `public/media/<id>/`.
- Modal: a dossier link with `"exhibit": "<id>"` instead of `"url"` renders a button that lazy-imports `src/modal.js`
  (native `<dialog>`: focus trapped, Esc closes, focus returns to the button). `app.js` ignores keys while a dialog is open.
- **Adding an exhibit = one `exhibits[]` entry + its `public/media/<id>/` folder, no code change.** Web encodes only:
  H.264/AV1 MP4 with a WebP poster, WebP/AVIF stills; every file < 50 MB, all media < ~300 MB. Same copy rules as the
  page (first person, verifiable, a REPOSITORY link). To show it in a modal too, add `{"k","label","exhibit"}` to a dossier's `links`.

## Verification
`scripts/check-links.sh` after `npm run build` (scans both pages and every chunk). Playwright kit in `~/agent-work/archive/agents/portfolio/BUILD-PLAN.md` §2:
zero console errors, `scrollWidth` 400 at phone width, keyboard path through all screens, reduced motion instant.

## History
- 2026-09-21 — built from the approved mockup (`~/agents/portfolio/mockups/05-direction-d.html`)
  in 8 tickets (`~/agent-work/archive/agents/portfolio/BUILD-PLAN.md`). Agents commit their own files and push (owner, 2026-11-17); never force-push.
- 2026-09-21 — every entry (5 cards + 2 graveyard) opens its own dossier: one renderer (`src/render/projects.js` `dossiers()`) driven by a `dossier` object per entry in `projects.json`; shells generated into the stage by `src/render/index.js` (`data-dossier`/`data-name` feed the `DOSSIER 0N` readout and rail names in `app.js`); repo links moved from cards into the dossier (`.links` control, ↑↓ + Enter); one shared lattice region `dossier`.
- 2026-09-21 — keyboard/touch UX pass: ↑↓ walk every `.tgt` then page-scroll the screen; PageUp/Down, Space, Home, End scroll the live screen from body; focus always lands on the new screen's first target (screens are `tabindex=-1`); Esc clears the highlight, then goes to IDENTITY, never a no-op; navigation asked for mid-transition is kept and played at settle (`intent()`/`pending`); horizontal swipe ≥ 60 px = ← →; `.hint` renders a `.kb` and a `.tc` variant (`hintTouch` in `identity.json`/`projects.json`), swapped by `(hover:none)`; `.cue` bottom fade + ▾ while the screen has more below (`body.more`); every outbound link `_blank noopener`; Dark Eye dossier got its REPOSITORY link.
- 2026-09-21 — fix: the body flag set while a dossier is live is `in-dossier` (was `dossier`, which matched the `.dossier div` grid rules and painted the fixed `.ap` aperture over the stage — dossiers rendered black).
- 2026-09-21 — ←/→ on a highlighted `.tgt` first look for a target on the same row (`beside()` in `app.js`: vertical centre inside the current rect, nearest to the left/right) and move the highlight there; only at the row's edge do they change screen. Single-column layouts are unchanged.
- 2026-09-21 — ↑/↓ on a highlighted `.tgt` are column-aware (`under()` in `app.js`): nearest target below/above whose x-range overlaps the current one, largest overlap first (within 2px = same column, since card rects carry sub-pixel jitter), then smallest vertical distance; falls back to the nearest target in any column, then to the page-scroll. Single-column layouts walk DOM order as before.
- 2026-10-09 — T303: entry 04 UBUNTU TOOLS (`card-ubuntu-tools` / `s-ubuntu-tools`) with its dossier and evidence links into github.com/ojnadjarm/ubuntu-tools (pushed `master` only); later entries renumbered 05–08. A lone last card after the flagship spans the row (`.card.flag~.card:last-child:nth-child(even)`), and `under()` in `app.js` ranks overlap as a share of the narrower rect so ↓ from the flagship lands on the half card below, not the spanning one.
- 2026-10-09 — T304: MOODLE, AT WORK is the flagship (entry 01, `flagship: true`, large card, dossier `[03·01]` "dossier · flagship · no public repository"); THE DARK EYE swapped into its old slot as entry 05 (`[03·05]`, "dossier · public repository"); README projects.json row aligned. No app.js/CSS change: card count unchanged, so the T303 lone-card span and `under()`/`beside()` hold.
- 2026-10-19 — T425: `scripts/stamp.mjs` (wired in `vite.config.js`) emits `dist/build.json` {commit, built}; `sites publish portfolio` verifies the served copy against it. No page change.
- 2026-10-20 — T1031: entry 06 AI AVATARS (`card-ai-avatars` / `s-ai-avatars`, later entries renumbered 07–09); hidden gallery sub-site `/portfolio/gallery/` (4 exhibits: AI Avatars tour video + 6 stills, AI Charts demo video, The Dark Eye browser-page demo, NaviAgent fairy demo; the last two are static scripted copies with no backend); the same exhibits open as modals from the AI Charts, Dark Eye, AI Avatars and NaviAgent dossiers. `check-links.sh` scans `dist/assets/*.js` and `dist/gallery/index.html`. A playable Godot web build was built and then removed at the owner's request (video and screenshots only); its export script is archived in `~/agent-work/archive/T1031-web-export/`.
