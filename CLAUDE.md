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
