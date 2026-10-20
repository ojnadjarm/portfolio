# portfolio

Your personal site: a single page, four screens (identity, knowledge, projects, record) on a
three.js lattice. Vanilla JS + CSS, built with Vite, content in JSON.

Live: https://ojnadjarm.github.io/portfolio/

## Commands

- `npm run dev` — dev server at http://localhost:5173/portfolio/
- `npm run build` — writes `dist/`; check it with `npm run preview`

Node 24. Run `npm ci` once after cloning.

## GitHub Pages

1. Push `main` to `github.com/ojnadjarm/portfolio`.
2. On GitHub: Settings › Pages › Source: **GitHub Actions**.
3. Wait for the "Deploy to GitHub Pages" run in the Actions tab. The published URL is shown on
   the run.

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. If you move to a
custom domain later, set `base: '/'` in `vite.config.js`.

## Editing content

Everything you read on the page lives in `src/content/`. The render modules in `src/render/`
only template it; the animation code never reads it.

| File | Holds |
|---|---|
| `identity.json` | Screen 01: kicker, name, hero paragraph, signature, "who" block |
| `knowledge.json` | Screen 02: lead line, the HOT/WARM/COLD rows, the nine EXPLORED one-liners |
| `projects.json` | Screen 03: the cards (the first, `flagship: true`, is the large one: Moodle, at work; entry 06 is AI Avatars), one `dossier` per entry (incl. the signal `path`; a link with `exhibit` instead of `url` opens that exhibit in a modal), the graveyard panel |
| `gallery.json` | The hidden gallery at `/portfolio/gallery/` (type `play` on the main page, or open `#play`): one entry per exhibit, media in `public/media/<id>/` |
| `record.json` | Screen 04: dated rows |
| `evidence.json` | The commit count (`count`, `asOf`, `url`), GitHub and LinkedIn URLs |
| `repos.json` | Names, URLs and one-liners of the linked repositories |

Rules:

- A field is plain text unless its name ends in `Html`. `Html` fields may contain only `<b>`,
  `<u>`, `<span class="lit">` and `<span style="color:var(--acc)">`; `src/render/h.js` escapes
  every other tag. Write real Unicode (`—`, not `&mdash;`).
- The commit count appears three times on the page and is rendered from
  `evidence.json` alone. Before changing it, open `evidence.json`'s `url` (the GitHub commit
  search), read the number there, then update `count` and `asOf` together.
- After a build, `scripts/check-links.sh` requests every URL in `dist/` and prints the HTTP
  status next to each. LinkedIn always answers `999` (its bot wall); that is not a broken link.

## Gallery and media

`/portfolio/gallery/` is not linked from the main page. To add an exhibit, add one entry to
`src/content/gallery.json` and put its files in `public/media/<id>/`; no code change. Use web encodes
(H.264 MP4 + WebP poster, WebP stills), keep each file under 50 MB and all media under about 300 MB.

## Copy rules

Every sentence on the page follows these; keep them when you edit:

- First person, professional, no introspection.
- Every claim links to evidence. The commit figure is what the search link shows, dated by
  `asOf`; private work is described qualitatively; Moodle core work is stated as "cannot be
  verified from outside".
- Colour: amber `#ffb000` plus neutrals, nothing else.
- No phone number or street address. Find-me is GitHub and LinkedIn only.
- No new screens: `ORDER`, `NAME`, `REGION` and the `/04` readout in `src/app.js` are fixed.
