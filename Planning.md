# Real Estate Agency Website — Planning Document

Real estate agency operating in Sofia, Bulgaria. Residential properties (apartments and houses) and building plots.

**Client brand: Sonar Development Company** ("Sonar" in the header, logo = two vertical lines/buildings). „Брокерски подход“ is the project codename / repo name, not the brand. The site presents both the agency services and the company's own developments (обекти with apartments).

> **Direction update (Sep 2026, from client notes in `notex.txt`)** — overrides older details below where they conflict:
> - **Colors:** page background `#faf9f7` (warm near-white) replaces `#eae5d9`; `--paper2: #f2eee3` for alternating sections. The maps still use `#eae5d9` for their paper — to be reconciled.
> - **Fonts:** serif, but *not* handwritten. Currently Montserrat as a placeholder (sans). MADE Tommy was considered — **not free for commercial use** (paid MADEType licence needed). Open decision, see §9.
> - **Comics:** business-oriented, corporate style — *not* childish/indie. Reference: the client's Instagram photos (not stored in the repo).
> - **Comics are now in muted colour (Oct 2026), not monochrome:** premium corporate editorial illustration with clean ink line art and flat muted fills (cream, beige, light grey, light oak) plus one deep teal-green accent `#013638`. Prompts: `sonar-files/ai-renders/ISTORII-PROMPTS.md`. Artwork is AI-generated (Gemini, 4:3 cropped to 3:2) and saved in `src/assets/istoria/`. Supersedes the "strictly monochrome" rules below.
> - **Map:** keep the graphite/ink style; add important orientation buildings (NDK, Nevsky done; more to come).
> - **Inspiration:** https://hristoshomov.com/keysoff

## 1. Vision & Differentiation

Every competitor site (elitebuild.bg, balkanikahomes.eu, bld.bg) is the same: "who we are" + a listings database. They sell inventory.

**This site sells the process and the trust.** The first impression is a hand-drawn comic story showing what it's like to work with the agency — from the first conversation to receiving the key (or celebrating the finished building). No Sofia agency communicates this visually.

### Key principle
The comic doesn't just decorate the site — it *is* the pitch. Slides 1–4 of the apartment story say: "we sit with you, we walk properties with you, we handle the paperwork, you get the key." For building plots, the full arc (idea → land → permits → construction → celebration → we sell the units for you) shows a multi-year partnership no listing page can express.

## 2. Entry Flow

**Original idea:** landing question "What are you looking for?" with three choices — apartment/house, building plot, just watching — where the first two lead to a mini presentation and the third to the main website.

**Refined approach (avoids the "gate" problem):**

- The **main site is the homepage**. The question "Какво търсите?" is the *hero section* — same three dramatic choices — but navigation, a listings teaser, and footer exist below it. Curious visitors click into the story; task-driven visitors scroll or use the nav.
- Why not a hard gate: it blocks users arriving from Google for a specific listing, an empty splash homepage is bad for SEO, and returning visitors shouldn't see it twice.
- Presentations live at their own shareable URLs (`/istoria/apartament`, `/istoria/parcel`) — they double as marketing assets for Facebook/Instagram ads.
- Remember the visitor's choice in `localStorage` — never gate anyone twice.

## 3. The Comic Presentations

### Story A — Apartments & Houses (5 panels)
1. People around a table discussing what the client needs — papers and a laptop showing properties on the table.
2. Two people — the agent in a suit, the client in casual clothes — walking through a property, looking around.
3. The purchase papers are organized by the agent.
4. The client receives the key.
5. "If you need that — call us." (CTA)

### Story B — Building Plots (7 panels)
1. People around a table discussing the client's needs — papers and a laptop showing maps and blueprints.
2. Agent and client next to a car, a green lawn in front of them. Camera behind them — the agent describes how this lawn has everything for the client's idea.
3. The agent parks in front of the authorities to process the client's papers.
4. The agency organizes the building process — agent and client walk the construction site.
5. Celebrating the finished building.
6. The agency's agents sell the client's built apartments/houses to buyers.
7. "If you need that — call us." (CTA)

### Storytelling refinements
- **The client is the protagonist, not the agency.** The reader identifies with the casually-dressed client, who carries the emotion in each panel: worried at the table → curious at the viewing → relieved at the paperwork → joyful with the key. The agent is the guide, not the hero. Same story, different camera.
- **Format:** scrollytelling / one-page parallax. Panels pin and reveal as the user scrolls.
- **Final panel CTA:** phone + **Viber** (Bulgaria runs on Viber) + short contact form — not just "call us".

## 4. Art Direction

- **Style:** clean ink line art with flat muted colour fills and a teal accent — **business-oriented, corporate tone** (client feedback, Sep 2026; originally black-and-white "indie graphic novel"; colour decided Oct 2026).
- **Background:** warm near-white `#faf9f7` with paper grain (originally cream `#eae5d9`). Never pure white.
- **Palette:** warm neutrals (cream, beige, light grey, light oak) + one deep teal-green accent `#013638`; no other saturated colours. (Originally strictly monochrome.)
- **Aesthetics:** hand-drawn look, expressive characters, dynamic panels with bold black borders.
- **Bubble space:** illustrations must have clear areas designed for speech bubbles and caption boxes without cluttering the action.

### Production rules
- **Speech bubbles are live HTML text overlaid on the artwork — never baked into the images.** This gives Bulgarian/English switching, SEO-indexable text, accessibility, and copy edits without redrawing.
- **Character consistency is the hard problem.** Whether commissioning an illustrator or generating with AI: lock a **character sheet** first (the suited agent, the casual client/couple) and reuse it across all ~12 panels.
- Export artwork as high-res WebP/AVIF; use SVG for decorative line elements (dividers, icons) so they stay crisp.
- **The aesthetic carries through the entire site** — paper texture background everywhere, ink-line dividers, hand-drawn icons, ink-style map pins. One visual world; the main site must not feel generic-modern after the comic intro.

## 5. Main Website Structure

| Section | Notes |
|---|---|
| Hero | "Какво търсите?" — three illustrated choices |
| Who we are | Comic charm + **real photos of the actual team** — buyers of expensive assets want real faces before they call |
| Our achievements | Numbers/milestones ("числата зад доверието": happy clients, deals closed) — **currently not on the page; open question whether it's needed** |
| Обекти | The company's own buildings (grid → `/obekti/[slug]` → `/obekti/[slug]/[suite]`) |
| What we offer | Services overview (buy, sell, plots, construction management) |
| Properties | Map **plus** filterable list — see below |
| Contacts | Phone, Viber, form, office location |

### Properties section
- The **3D ink map** (see section 6) is the centerpiece, but **not the only browsing mode**.
- Filterable list alongside the map: **neighborhood** (most important — Sofia buyers think in Лозенец, Бояна, Драгалевци…), price, m², type.
  - ✅ Implemented on `/imoti`: neighborhood, type (сграда/парцел), apartment type (1-стаен…Мезонет). Filters hide non-matching objects on the map and in the list, then re-frame the camera. **Price and m² filters wait for real per-apartment prices/sizes** in the data.
- Section separation: alternate `--paper` / `--paper2` backgrounds between homepage sections (client request).
- **Each property gets its own page** — that's where SEO traffic lands.
- Content-marketing idea: **neighborhood guides drawn in the same ink style** — great SEO and shareable. A small hand-drawn isometric map per neighborhood (with landmarks) fits here, where a drawn map *can* scale.

## 6. The Map — "Ink City" in 3D

**Concept:** not a flat map with pins, but a tilted 3D map of Sofia rendered as an ink drawing on paper. Lives in the site at `/imoti` — `src/components/PropertyMap.astro` (MapLibre GL + free OpenFreeMap/OSM vector tiles, no API key). The old standalone `demo-map/` was removed.

**Data:** the map reads `src/data/buildings.ts` — the same source as the homepage grid and the `/obekti` pages. Each building has an optional `map` field: `lon`/`lat`, footprint (`box` or multi-part `parts`), `plot` size, `approxRadius` (address privacy), and a fly-to `view`. Popups link to `/obekti/<slug>`.

### Visual language
- Fully custom map style: cream paper `#eae5d9` background with grain texture, black ink roads, neighborhood labels, the whole city as **pale, low, sketch-like 3D volumes**.
- **Buildings with listings rise out of the sketch**: extruded taller, solid black ink, with floating price tags — exaggeration by *height*, not width (width would distort streets and confuse orientation).
- Clicking a listing opens a **comic caption-box popup** (cream, 3px black border, offset shadow) with photo, price, m², link to the property page.
- **Building plots** (no building to extrude): hand-hatched polygon with dashed ink border; flatter camera when zoomed out to the surroundings.
- **Landmark buildings, implemented**: rather than flat drawn-icon markers (the original idea below), NDK and the Alexander Nevsky Cathedral are real stylized 3D volumes on the map (`src/components/PropertyMap.astro`) — a MapLibre custom layer rendered with three.js, since MapLibre's native `fill-extrusion` can't produce curved/domed geometry. Simplified, low-poly, ink-outlined shapes (NDK: stacked tapering tiers + spire; Nevsky: cross-plan base + domed drum + taller bell tower + minor domes), always pale (`#d6cfbe`, same tone as the rest of the sketched city) — never black, since black stays reserved for listings. Not real architect models (rejected per the project's "stylized, not photorealistic" approach for orientation anchors); real glTF models remain reserved for showcase listing buildings per the tiers above.
- Original landmark idea (superseded by the above for these two buildings, may still suit others): small drawn illustrations as markers (Витоша, НДК, Александър Невски) so visitors orient instantly.
- Rejected alternative: a fully illustrated isometric map of the whole city — maximum charm but can't cover Sofia + surroundings, and every listing change means artwork changes. Kept only for neighborhood guide pages.

### Building fidelity — three levels
1. **Real footprint (standard for every exact-address listing).** The extrusion engine takes any polygon — snap to the real OSM building outline, or trace from the blueprint / cadastral sketch (скица from КККР). Multi-part footprints give wings, towers, terraced setbacks (demoed: L-shaped building + corner tower + set-back penthouse). Minutes of work per building.
2. **Floor-by-floor (new developments sold off-plan).** Each part has its own base and height → show available floors in black, sold floors pale; a floor click can open that floor's plan.
3. **True 3D model (showcase projects only).** MapLibre custom layer + three.js renders a **glTF/GLB** model at real coordinates — any architect format (Revit, ArchiCAD, SketchUp) exports to glTF. Rendered flat-black with toon/ink outline shading so it matches the drawing. Prep step: strip BIM interiors, compress to ~1–5 MB. Per-building investment — reserve for one or two flagship developments.

*Georeferencing caveat:* blueprints live in local coordinates — footprints must be aligned to the map (trace over cadastre/satellite; БГС 2005 cadastral files can be converted programmatically).

### Address privacy
Per-listing flag — highlighting the exact building reveals the exact address:
- **Exact:** black extruded building (fine for openly marketed developments).
- **Approximate:** dotted ink circle over the area, "точният адрес — при контакт" (for private-seller listings).

### Color: hand-tinted, not realistic
Decision after live comparison (toggle in the demo): the properties map uses **hand-tinted ink** — black linework with muted watercolor washes — because orientation sells ("до Южния парк" is a genuine selling point). Hard rules so it never drifts toward Google Maps:
- Maximum two wash colors: sage green (parks), pale gray-blue (water), both desaturated toward the paper tone.
- Never color roads or buildings.
- **Black is reserved for listings** — nothing on the map may be darker than a property for sale.
- The comic presentations were originally meant to stay monochrome; since Oct 2026 they use the muted corporate palette above. The map's two-wash rule is unchanged.

### Building viewer on the property page (implemented Sep 2026)
"Виж обекта" opens `/obekti/<slug>`: **viewer on top, information below**. Flow: orbit the building → click a floor (or the lift-style floor panel) → floors above disappear, apartments on that floor appear colored by status → click an apartment (3D or its chip) → details card + link to `/obekti/<slug>/<n>`. The page's apartments table highlights in sync, and state is in the URL (`?floor=3&unit=5`, used by the apartment page's "Виж го в сградата" link).
- **Three sources, first available wins:** real `.glb` model → procedural massing generated from floors/apartments (placeholder) → 2D façade image with clickable floor polygons. Automatic fallback to the image when WebGL is missing or the model fails.
- **Model contract:** `.glb`, meters, Y-up, < 5 MB, nodes named `floor_N` and `unit_<Suite.number>`; everything else is plain building. Houses/single apartments without floor nodes → orbit-only. Full instructions: README "3D models".
- **Colors follow the map rule:** black = available (for sale), gray = reserved, pale = sold, accent = selected. The model's own materials are overridden with the ink style, so textures aren't needed.
- **Libraries:** three.js (`GLTFLoader`, `OrbitControls`) — already a dependency, loaded via dynamic import only on pages with 3D. Rejected `<model-viewer>`: great for single-object viewing, awkward for per-floor isolation and per-apartment picking.
- The placeholder demo buildings (Обект 1–4) were removed once Сграда А was in; the 3D code path (procedural / `.glb`) stays, unused until a real model arrives.
- **First real building — Sonar Residence, Сграда А (Oct 2026), 2D only:** façade render (catalogue p.9) → click a floor → the architect's floor plan for that кота (−3.05 garage from the catalogue, ±0.00 / +3.05 / +6.10 from the РАЗПРЕДЕЛЕНИЕ PDFs, title block cropped off) with each apartment outlined and status-colored → apartment page with the catalogue plan, areas and the price table per payment scheme. Data model: explicit `floors` per building (`number`, `label`, `level`, `plan`, `facade` outline, `units` outlines); suites have `floors: number[]` so maisonettes span two floors. Source material lives in `sonar-files/` (gitignored, confidential).
- **One visual language from building to apartment (Oct 2026):** the apartment page leads with the same AI floor visualisation as the building viewer, cropped to the apartment in CSS (one crop per floor it occupies, neighbours faded, live room labels); the catalogue plan stays one click away under „План с размери“. In the viewer the picked apartment's facts + „Разпределение и цени →“ sit in a strip inside the stage (no longer a card below, out of sight); „План“ (viewer and apartment page) shows the architect's technical drawing with every dimension (`floor-N-tech.png`, same crop as the clean plan so outlines and renders still align), without our live room labels; +/− magnifier (1.5×, 2×) with drag.
- Later: floor plan images per apartment (in the floor view and on the apartment page), and showing the real model on the city map (tier 3 above).

### Practical constraints
- **Mobile:** 3D extrusion is heavy on cheap phones — fall back to the same ink-styled map, flat, with clickable ink pins.
- **Listing-entry workflow:** adding a property includes picking its OSM building footprint (or drawing the plot polygon) — trivial at tens of listings, but must be part of the process.

## 7. Technical Plan

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** (scaffolded at repo root — `package.json`, `src/pages`, `src/layouts`, `src/components`) | Mostly static content, fast, excellent SEO out of the box; interactivity only where needed. Next.js would be overkill. |
| Scrollytelling | **GSAP ScrollTrigger** (v1 can start with CSS `scroll-snap`) | Pinned scenes, panels reveal on scroll |
| Map | **MapLibre GL + OpenFreeMap (OSM vector tiles)** | Free, no API key, fully custom "ink city" 3D style (see section 6); three.js custom layer for glTF showcase models |
| Listings data | `src/data/buildings.ts` (typed TS array, single source for grid, detail pages, map) → content collections / headless CMS (Sanity/Directus) later | Tens of properties don't need a CMS on day one |
| Hosting | GitHub Pages, auto-deploy on push to `main` (`.github/workflows/deploy.yml`), base path `/brokerski-podhod/` | Free, static. Drop `base` when a custom domain arrives |
| Contact form | **Not wired yet** — static hosting needs a form service (Formspree/Web3Forms) | |
| Images | WebP/AVIF, responsive sizes; SVG for line decorations | Performance + crispness |
| i18n | Bulgarian primary, English secondary | Live-text bubbles make this possible |

### Mobile & accessibility
- Most real-estate traffic is mobile: scrollytelling degrades to **simple full-screen snap panels** — no pinning/parallax tricks on phones.
- Respect `prefers-reduced-motion`.
- Alt text on every panel; bubble text is real text, so screen readers get the full story.

### SEO essentials
- Main site at the root (no splash gate), presentations at `/istoria/*`.
- Individual property pages with structured data (schema.org `RealEstateListing`).
- Neighborhood guide pages as long-tail content.

## 8. Roadmap

1. ~~**Prototype the 3D ink map**~~ — ✅ done: originally `demo-map/index.html`, now `/imoti` in the site (ink-styled 3D Sofia, black listing buildings with price tags, blueprint-shaped multi-part building, hatched plot, approximate-location circle, comic popups, sidebar list with fly-to). Since extended with stylized 3D landmarks (NDK, Alexander Nevsky) — see §6.
2. ~~**Client presentation**~~ — ✅ done: `presentation/` — 8-slide deck in Bulgarian, built in the project's own ink-on-paper aesthetic; sendable as `Brokerski-podhod-koncepcia.html` (interactive) or `Brokerski-podhod-koncepcia.pdf` (attachment-safe). Ends with five concrete feedback questions for the client (style fit, story accuracy, showcase properties, blueprints/3D models, team photos).
3. **⏳ Client feedback still pending** — presentation/GitHub Pages logistics were dropped; site build moved ahead anyway (steps 4-5 below are also still outstanding, picked up out of order).
4. **Prototype the apartment story** — working scrollytelling page with placeholder panel sketches, real Bulgarian bubble text, GSAP scroll behavior, mobile fallback. Validate the concept in the browser before investing in final artwork.
5. Lock the art direction: character sheets, one finished sample panel.
6. ~~**Build the main site skeleton**~~ — ✅ done: real Astro project (not just static HTML) at the repo root, with the paper/ink/grain design system in `src/styles/global.css` + `src/layouts/Layout.astro`. Homepage (`src/pages/index.astro`) has all six sections from §5 (hero with the three choices + `localStorage` intent, who we are, achievements, services, properties teaser, contacts) with placeholder copy/content where real assets aren't ready yet. Stub routes exist at `/imoti`, `/istoria/apartament`, `/istoria/parcel`.
7. **Properties** — mostly ✅: map ported into the site (`/imoti`), data model in `src/data/buildings.ts` shared by grid/detail pages/map, filterable list (neighborhood, type, apartment type), building + apartment detail pages. Still open: price/m² filters (need real data), schema.org `RealEstateListing` structured data, real content.
8. Produce all ~12 final panels; wire up both presentations.
9. Neighborhood guides, English version, polish, launch.

## 9. Open decisions & to-dos (Sep 2026)

- **Font:** buy MADE Tommy licence, or pick a free Cyrillic serif (client wants serif, not handwritten). Montserrat is a placeholder.
- **Achievements section:** keep or drop? If kept — which real numbers.
- **Section separation:** alternate backgrounds between homepage sections.
- **Map paper color:** maps still use `#eae5d9` while the page is `#faf9f7` — align or keep deliberately.
- **Contact form:** wire to a form service, or replace with phone/Viber links.
- **Logo:** client to provide the mark alone (two lines/buildings, no text) as a file.
- **Real content** (client): team names/titles, phone/Viber/address, buildings, photos, apartment plans and prices.
- **Comic stories:** `/istoria/*` still placeholders; character sheets in the new corporate style first.
- **Research:** Google real-building extraction videos (in `notex.txt`) — for the 3D-model tier.
- Housekeeping: `src/assets/logo-transparent.pngZone.Identifier` (Windows leftover) and unused logo variants in `src/assets`.
