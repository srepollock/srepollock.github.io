# Redesign plan

Decisions agreed before the rebuild (November 2026).

| Area | Decision |
|---|---|
| Interaction model | A persistent three.js city behind normal HTML routes. Each route is a district, and route changes fly the camera there. URLs, SEO and keyboard/screen-reader navigation work as on any static site. |
| Framework | Next.js App Router, `output: "export"`, deployed to GitHub Pages. No server features. |
| 3D | react-three-fiber, procedural and instanced, no model downloads. Lazy-loaded after hydration. Budget: 250 KB gzipped for the 3D chunk. |
| Positioning | Platform engineer & builder. Developer Box is the founder story. Leadership shows through the narratives, not a title. |
| Routes | `/` skyline · `/work` harbour/industrial · `/projects` market · `/about` residential · `/contact` radio tower. Existing `/work/<slug>` URLs are preserved. |
| Content | Regenerated from the 2026 resume and the existing case studies. No phone number. |
| Projects | Personal projects tagged open or closed source; closed-source projects get no repo link. Developer Box projects link to `developerbox.ca/projects/<slug>/` with a "coming soon" flag until those pages exist. |
| Look | Future Vancouver at dusk: harbour, North Shore ridges, glass towers, amber windows, one cyan neon. Rain toggle. |
| Theme | Dark = dusk city, light = overcast day. Follows the system preference until toggled. |
| Degradation | Quality tiers by device, static camera under reduced motion, CSS/SVG skyline without WebGL, persistent "city off" switch. |
| Tooling | Yarn 4 (`node-modules` linker), strict TypeScript, Tailwind v4, MDX, Vitest, Playwright. |
| Type | Space Grotesk (display), Inter (body), JetBrains Mono (HUD/code) via `next/font`. |
| Contact | Email, GitHub, LinkedIn and Medium links. No form, no resume download, no analytics. |

## Delivery

1. **Foundation**: the Next.js migration, content, city scene, camera flights, fallbacks, and the
   projects + Developer Box scaffolding.
2. **⌘K terminal + pipeline traffic**: a command palette styled as a shell (`cd projects`, `whoami`,
   `deploy`, `theme`, `rain on`), and light-trail traffic flowing between districts as a CI/CD metaphor.
3. **Free-fly + Easter eggs**: WASD/arrow-key free-fly with clickable landmark beacons; a
   lacrosse whistle on the Konami code, a snowboard run down the North Shore ridge, `sudo make me
   a sandwich`, and a leaning "git blame" tower in the park.
