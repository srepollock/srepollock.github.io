# Developer Box project pages: handoff

spollock.ca links each Developer Box project to `https://developerbox.ca/projects/<slug>/`, which
`devboxProjectUrl()` in `src/lib/devbox.ts` builds. Those pages don't exist yet.

## Slugs currently linked

| Slug | Title |
|---|---|
| `caravan` | Caravan |
| `quickbooks-vendor-payments` | QuickBooks vendor payments |
| `developer-box-website` | Developer Box website |

When a page goes live, set `devboxPageLive: true` on the matching entry in `src/data/projects.ts`.

## Suggested page content

The fields mirror `DevboxProject` in `src/data/projects.ts`, so both sites can share one source later:
`slug`, `title`, `pitch`, `summary[]`, `stack[]`, `status`, `years`, plus whatever the company
page needs on top (client quote, screenshots, outcome).

## Notes on the current developerbox.ca codebase

As read from `DeveloperBox-CA/website` at the time of writing:

- Create React App + react-router v5, with a single route (`/`, `/home`). There is no `/projects` route.
- Firebase Hosting has a catch-all rewrite to `/index.html`. So `/projects/<slug>/` currently serves
  the home page rather than a 404, though not a project page.
- Because it's a client-rendered SPA, per-project pages won't be individually indexable unless it
  moves to static generation or prerendering.
