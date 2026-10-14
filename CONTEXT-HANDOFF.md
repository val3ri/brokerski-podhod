# Context Handoff — Real Estate Agency Website ("Брокерски подход")

> **Purpose of this file:** complete handoff of AI co-design/co-development sessions (July 2026, updated Sep 2026).
> Paste or attach this file at the start of a new session so the assistant can continue with full context.
> **Canonical project plan: [Planning.md](Planning.md)** — read it first; it holds all design decisions in detail.
> This file adds everything *around* the plan: reasoning, project state, workflows, gotchas, and open items.

---

## 1. The user & working style

- Valeri Penchev, designer & developer building a website for a real estate agency in Sofia, Bulgaria.
- Conversation language: English. **All client-facing output must be in Bulgarian** (site copy, presentation, popups).
- Works collaboratively — wants a co-designer who gives honest opinions and recommendations, not just execution. Discuss ideas, then he decides, then document decisions in `Planning.md`.
- Established habit: after significant discussions, he asks to update `Planning.md`. Keep it current without being asked.

## 2. Project in one paragraph

A real estate agency site (apartments, houses, building plots in Sofia) that differentiates by *selling trust and process, not listings*: visitors are greeted with "Какво търсите?" and the apartment/plot paths lead to short scrollytelling **comic stories** (black-ink comics, now in a business/corporate style per client feedback) showing the client's journey with the agency. The properties map is a tilted **3D "ink city"** — Sofia as a pale sketch with listing buildings rising in solid black. Full concept, art direction, structure, tech stack, and roadmap: see `Planning.md`.

## 3. Repository state (as of 2026-09-24)

Real **Astro** site at the repo root, deployed to GitHub Pages on every push to `main`
(https://val3ri.github.io/brokerski-podhod/). How to run it: see [README.md](README.md).

```
brokerski_podhod/
├── README.md / Planning.md / CONTEXT-HANDOFF.md / CLAUDE.md
├── notex.txt                 # client feedback notes (Bulgarian) — source of the Sep 2026 direction update
├── claude-prompt.txt         # the user's original idea brief
├── astro.config.mjs          # site + base '/brokerski-podhod/' for GitHub Pages
├── .github/workflows/deploy.yml
├── src/
│   ├── pages/index.astro     # homepage: hero, team, services, обекти grid, map teaser, contacts
│   ├── pages/imoti/          # full-screen 3D ink map + filters (PropertyMap.astro)
│   ├── pages/obekti/         # [slug].astro building page, [slug]/[suite].astro apartment page
│   ├── pages/istoria/        # apartament / parcel — placeholders, comics not built
│   ├── data/buildings.ts     # ⭐ single source for grid, detail pages and map
│   ├── components/           # Header, Footer, Hero (orbiting map), PropertyMap, PropertyPreviewMap, SplitSection
│   └── styles/global.css     # color + font variables
├── public/models/nevsky/     # glTF model of Alexander Nevsky (CC BY 4.0, attribution in map)
└── presentation/             # July 2026 pitch deck — old branding, not part of the site
```

- Brand is now **Sonar Development Company**; „Брокерски подход“ is only the codename.
- `demo-map/` was removed — the map lives in `src/components/PropertyMap.astro`.

## 4. Decision log (chronological, with reasoning)

1. **Entry gate → hero section.** Original idea was a forced "What are you looking for?" splash before any content. Changed: the main site is the homepage; the question is the *hero* with the three choices; stories live at own URLs (`/istoria/apartament`, `/istoria/parcel`); choice remembered in `localStorage`. Reasons: SEO (splash homepage is poison), users arriving from Google for a listing, returning visitors.
2. **Two comics, not one.** User asked whether to merge them. Decision: keep two. Different audiences/anxieties, different lengths (5 vs 7 panels; merged ≈12 = scroll drop-off), separate URLs enable targeted ads. Panel 1 and the CTA panel are shared/reusable artwork between both.
3. **Client is the protagonist, agent is the guide.** Reframed the panels so the reader identifies with the casually-dressed client carrying the emotion.
4. **Speech bubbles = live HTML text overlaid, never baked into artwork.** Enables BG/EN i18n, SEO, accessibility, copy edits.
5. **Map = real 3D map, ink-styled (not illustrated isometric).** Rejected a fully drawn city map (can't scale, artwork changes with listings). Listing emphasis via **height** (tall black extrusions), not width (would distort streets). Illustrated isometric maps kept only for future neighborhood-guide pages.
6. **Building fidelity — three levels** (all proven feasible, level 1–2 demoed): (a) real footprint traced from OSM/blueprint/кадастрална скица — standard for exact-address listings; (b) floor-by-floor extrusion parts for off-plan developments (available floors black, sold pale); (c) glTF/GLB architect models via MapLibre custom layer + three.js, toon/ink-shaded, stripped & compressed to 1–5 MB — reserved for showcase projects. Georeferencing caveat: blueprints are in local coords (БГС 2005 convertible).
7. **Address privacy flag per listing:** exact black building vs. dotted ink circle "точният адрес — при контакт" (private sellers).
8. **Color decision — "hand-tinted ink":** user asked about realistic colors (green parks etc.). Agreed on a middle ground after a live A/B toggle in the demo: muted sage wash for parks + pale gray-blue for water, on the properties map only. **Hard rules:** max two wash colors, desaturated toward paper tone; never color roads/buildings; **black is reserved for listings — nothing may be darker than a property for sale**; comics stay strictly monochrome.
9. **Contact CTA:** phone + **Viber** (dominant in Bulgaria) + short form — not just "call us".
10. **Tech stack:** Astro (static-first, SEO), GSAP ScrollTrigger for scrollytelling (CSS scroll-snap acceptable for v1), MapLibre GL + **OpenFreeMap** vector tiles (free, no API key), listings as content collections first / headless CMS later. Mobile: comics degrade to snap panels, map falls back to flat ink pins; respect `prefers-reduced-motion`.

## 5. The map demo — technical notes

Now `src/components/PropertyMap.astro` (originally `demo-map/index.html`, since removed). Run with `npm run dev` → `http://localhost:4321/brokerski-podhod/imoti`. Needs internet (tiles + glyphs). Listing data comes from `src/data/buildings.ts`, serialized into a `<script type="application/json" id="map-data">` in the frontmatter (client scripts can't import the image-bearing data module directly). Filters use `map.setFilter` on the slug of each feature across all listing layers.

- Custom MapLibre style written from scratch: paper background, grain via inline-SVG `feTurbulence` overlay, ink roads, OMT `building` layer as pale extrusions (`render_height`), neighborhood labels (`Noto Sans Italic` — OpenFreeMap glyphs only ship Noto stacks).
- 4 placeholder обекти in `buildings.ts`: 2 exact (black extrusions + floating "от …€" price labels), 1 approximate (Иван Вазов; dotted circle), 1 plot (Панчарево; hatched `fill-pattern` from a runtime canvas image + dashed outline). Helper fns: `rect()`, `poly()` (meter-offset footprints), `circle()`.
- Обект 3 (Изток) demonstrates a **multi-part "blueprint" footprint**: L-shaped wings + corner tower + set-back penthouse via per-feature `base`/`height` on `fill-extrusion`.
- Comic-styled popups (overridden `.maplibregl-popup-content`) linking to `/obekti/<slug>`, sidebar cards with `flyTo`, mobile bottom sheet. Hand-tint washes are baked in (the toggle was removed after the decision).
- **Gotcha fixed once already:** the MapLibre global is `maplibregl`, not `maplibre`.
- **Font gotcha:** any font must have **Cyrillic** (Patrick Hand was dropped for lacking it). Site fonts are set once in `src/styles/global.css` (`--font-display`, `--font-body`) — currently Montserrat as a placeholder.
- **Base path gotcha:** all internal links must be built as `${import.meta.env.BASE_URL}path`; `localhost:4321/` without `/brokerski-podhod/` is a 404.
- In production, listing footprints should snap to real OSM building outlines (manual pick during listing entry).
- **3D model file formats (landmarks/showcase buildings):** both glTF and FBX load fine via three.js (`GLTFLoader` / `FBXLoader`, both `three/addons/loaders/...`, imported from the `three` npm package as in `src/components/PropertyMap.astro`). Key difference: **glTF is typically multi-file** — a `.gltf` JSON + a `.bin` geometry buffer + separate texture images (that's the shape of the sourced Nevsky model in `public/models/nevsky/`) — while **FBX is normally a single self-contained binary file** that embeds geometry/materials and often textures too. Neither shape is wrong; it's just how each format packages things. **glTF's spec mandates real-world units (meters) and Y-up**, so calibration is predictable; **FBX units/axis convention vary by exporting tool** (cm vs m, Y-up vs Z-up), so an FBX import may need the same scale/position/rotation calibration pass done for Nevsky (see `NEVSKY_REAL_HEIGHT`/`NEVSKY_ROTATION_DEG`/`NEVSKY_OFFSET_X`/`NEVSKY_OFFSET_Z` constants in `src/components/PropertyMap.astro`) — or more, if the axis convention differs.

## 6. The client presentation

`presentation/index.html` — 8 slides, Bulgarian, scroll-snap navigation, built deliberately in the project's own aesthetic (the deck *demonstrates* the concept). Slides: title → problem (all agency sites look alike) → the idea (three paths) → both comic scripts as panel strips → visual style + swatches → the ink map (with inline SVG sketch) → site structure → **five feedback questions for the client** + next step. Print styles included (one slide per page).

- PDF regeneration (after edits), with a static server running:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="presentation/Brokerski-podhod-koncepcia.pdf" --virtual-time-budget=8000 "http://localhost:8642/presentation/"`
  (Remember to also refresh the `Brokerski-podhod-koncepcia.html` copy if `index.html` changes.)
- Recommended sending strategy (agreed): email the **PDF**, mention the interactive version exists → excuse for a live meeting showing the HTML deck + map demo.

## 7. Open items / next steps (Sep 2026)

Full list in Planning.md §9. Headlines:
1. **Client content** — team names, phone/Viber/address, real buildings, photos, apartment prices. Client feedback on the July presentation came back as `notex.txt` (direction update is in Planning.md).
2. **Font decision** — client wants serif, not handwritten; MADE Tommy needs a paid commercial licence.
3. **Contact form** does nothing yet (static hosting → needs Formspree/Web3Forms or similar).
4. **Comic stories** (`/istoria/*`) — scrollytelling prototype, now in a corporate/business comic style; lock character sheets first.
5. Map: price/m² filters once real prices exist; schema.org structured data; more landmarks.
6. Homepage: alternating section backgrounds; decide on the achievements section.

## 8. Design principles to preserve (quick reference)

- Page `#faf9f7` (paper2 `#f2eee3` for alternating sections), ink `#2c2b28`; never pure white; grain texture everywhere. Maps still use `#eae5d9` paper.
- Comic boxes: solid ink border + offset ink shadow. Fonts via CSS variables, must be Cyrillic-safe.
- Comics strictly monochrome; map may use the two approved washes only.
- Black on the map is reserved for properties for sale.
- One visual world across the whole site — the main site must not feel generic after the comic intro.
