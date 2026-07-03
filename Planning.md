# Real Estate Agency Website — Planning Document

Real estate agency operating in Sofia, Bulgaria. Residential properties (apartments and houses) and building plots.

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

- **Style:** black and white comic book art, indie graphic novel style, clean ink line art.
- **Background:** off-white / cream / vintage paper texture — `#eae5d9`. Never pure white.
- **Palette:** strictly monochrome, high-contrast black ink, no colored elements; subtle ink washes for shadows.
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
| Our achievements | Numbers/milestones, drawn in the ink style |
| What we offer | Services overview (buy, sell, plots, construction management) |
| Properties | Map **plus** filterable list — see below |
| Contacts | Phone, Viber, form, office location |

### Properties section
- The **3D ink map** (see section 6) is the centerpiece, but **not the only browsing mode**.
- Filterable list alongside the map: **neighborhood** (most important — Sofia buyers think in Лозенец, Бояна, Драгалевци…), price, m², type.
- **Each property gets its own page** — that's where SEO traffic lands.
- Content-marketing idea: **neighborhood guides drawn in the same ink style** — great SEO and shareable. A small hand-drawn isometric map per neighborhood (with landmarks) fits here, where a drawn map *can* scale.

## 6. The Map — "Ink City" in 3D

**Concept:** not a flat map with pins, but a tilted 3D map of Sofia rendered as an ink drawing on paper. A working demo exists at `demo-map/index.html` (MapLibre GL + free OpenFreeMap/OSM vector tiles, no API key).

### Visual language
- Fully custom map style: cream paper `#eae5d9` background with grain texture, black ink roads, neighborhood labels, the whole city as **pale, low, sketch-like 3D volumes**.
- **Buildings with listings rise out of the sketch**: extruded taller, solid black ink, with floating price tags — exaggeration by *height*, not width (width would distort streets and confuse orientation).
- Clicking a listing opens a **comic caption-box popup** (cream, 3px black border, offset shadow) with photo, price, m², link to the property page.
- **Building plots** (no building to extrude): hand-hatched polygon with dashed ink border; flatter camera when zoomed out to the surroundings.
- Landmark idea: small drawn illustrations as markers (Витоша, НДК, Александър Невски) so visitors orient instantly.
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
- The comic presentations stay **strictly monochrome** — no color in the brand statement.

### Practical constraints
- **Mobile:** 3D extrusion is heavy on cheap phones — fall back to the same ink-styled map, flat, with clickable ink pins.
- **Listing-entry workflow:** adding a property includes picking its OSM building footprint (or drawing the plot polygon) — trivial at tens of listings, but must be part of the process.

## 7. Technical Plan

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** | Mostly static content, fast, excellent SEO out of the box; interactivity only where needed. Next.js would be overkill. |
| Scrollytelling | **GSAP ScrollTrigger** (v1 can start with CSS `scroll-snap`) | Pinned scenes, panels reveal on scroll |
| Map | **MapLibre GL + OpenFreeMap (OSM vector tiles)** | Free, no API key, fully custom "ink city" 3D style (see section 6); three.js custom layer for glTF showcase models |
| Listings data | Astro content collections (markdown/JSON in repo) → headless CMS (Sanity/Directus) later | Tens of properties don't need a CMS on day one |
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

1. ~~**Prototype the 3D ink map**~~ — ✅ done: `demo-map/index.html` (ink-styled 3D Sofia, black listing buildings with price tags, blueprint-shaped multi-part building, hatched plot, approximate-location circle, comic popups, sidebar list with fly-to, hand-tint toggle).
2. ~~**Client presentation**~~ — ✅ done: `presentation/` — 8-slide deck in Bulgarian, built in the project's own ink-on-paper aesthetic; sendable as `Brokerski-podhod-koncepcia.html` (interactive) or `Brokerski-podhod-koncepcia.pdf` (attachment-safe). Ends with five concrete feedback questions for the client (style fit, story accuracy, showcase properties, blueprints/3D models, team photos).
3. **⏳ Awaiting client feedback** — send the presentation; the client's answers gate the art direction and which properties go on the map first.
4. **Prototype the apartment story** — working scrollytelling page with placeholder panel sketches, real Bulgarian bubble text, GSAP scroll behavior, mobile fallback. Validate the concept in the browser before investing in final artwork.
5. Lock the art direction: character sheets, one finished sample panel.
6. Build the main site skeleton (hero with the three choices, sections, contacts).
7. Properties: data model, list + filters, production map (port the demo into the site), property detail pages.
8. Produce all ~12 final panels; wire up both presentations.
9. Neighborhood guides, English version, polish, launch.
