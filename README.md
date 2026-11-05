# spollock.ca

Personal site for Spencer Pollock. Static Next.js export served by GitHub Pages, with a procedural
three.js city behind the content. Each route is a district, and navigating flies the camera between them.

## Commands

```bash
yarn install
yarn dev          # http://localhost:3000
yarn build        # static export to ./out
yarn start        # serve ./out
yarn lint && yarn typecheck && yarn test
yarn test:e2e     # Playwright against ./out (run `yarn build` first)
```

## Layout

| Path | What |
|---|---|
| `src/app/` | Routes: `/`, `/work`, `/work/[slug]`, `/projects`, `/projects/[slug]`, `/about`, `/contact` |
| `src/data/` | Typed content — resume (`experience.ts`), case-study metadata (`work.ts`), `projects.ts`, `site.ts` |
| `content/work/*.mdx` | Case-study bodies |
| `src/lib/districts.ts` | Route → district mapping and camera poses |
| `src/lib/devbox.ts` | Developer Box project links (`https://developerbox.ca/projects/<slug>/`) |
| `src/components/city/` | The 3D scene: generation, shaders, camera flights, traffic lanes, fallback skyline |
| `src/lib/terminal.ts` | ⌘K shell commands (pure; the UI in `src/components/ui/Terminal.tsx` applies their effects) |

## Adding a project

Add an entry to `src/data/projects.ts`:

- `kind: "personal"` renders a detail page at `/projects/<slug>/`. Set `visibility: "open"` and
  `repoUrl` only for public repos.
- `kind: "devbox"` links out to `developerbox.ca/projects/<slug>/`. Leave `devboxPageLive: false`
  until that page exists; the card shows a "coming soon" note.

## Shell

Press ⌘K / Ctrl+K, or the `>_ shell` button. Run `help` for the command list. Commands are pure
functions that return output lines plus effects (navigate, change settings, clear, close), so they're
unit-tested without a browser. The shell's code loads on first open.

## Degradation

Content renders as static HTML first. The 3D chunk is lazy-loaded after hydration.

- Low-power, touch or narrow devices get a lighter city: fewer buildings, capped DPR and 30 fps.
- `prefers-reduced-motion` gets a static camera that cuts between districts instead of flying.
- No WebGL, or the city switched off from the header, gets a CSS/SVG skyline. The switch persists.

## Deploy

`.github/workflows/deploy.yml` runs lint, typecheck, unit tests, build and e2e on every PR. Pushes
to `master` also deploy `out/` to GitHub Pages.
