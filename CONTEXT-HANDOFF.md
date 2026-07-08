# Context Handoff — Real Estate Agency Website ("Брокерски подход")

> **Purpose of this file:** complete handoff of an AI co-design/co-development session (July 2026).
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

A real estate agency site (apartments, houses, building plots in Sofia) that differentiates by *selling trust and process, not listings*: visitors are greeted with "Какво търсите?" and the apartment/plot paths lead to short scrollytelling **comic stories** (black-ink indie graphic novel style on cream paper `#eae5d9`) showing the client's journey with the agency. The properties map is a tilted **3D "ink city"** — Sofia as a pale sketch with listing buildings rising in solid black. Full concept, art direction, structure, tech stack, and roadmap: see `Planning.md`.

## 3. Repository state (as of 2026-07-04)

```
brokerski_podhod/
├── claude-prompt.txt        # the user's original idea brief (source of the vision)
├── Planning.md              # ⭐ canonical plan — all decisions live here
├── CONTEXT-HANDOFF.md       # this file
├── demo-map/
│   └── index.html           # ✅ working 3D ink-map demo (details in §5)
└── presentation/
    ├── index.html                      # 8-slide client pitch deck, Bulgarian, on-brand
    ├── Brokerski-podhod-koncepcia.html # identical copy with client-friendly filename
    └── Brokerski-podhod-koncepcia.pdf  # PDF export (388 KB, 8 pages)
```

- Git: repo initialized, single commit "first commit" on `main`; the work above may be uncommitted — check `git status`.
- Nothing deployed anywhere yet. No build system, no framework yet — everything so far is standalone HTML.

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

`demo-map/index.html` — fully self-contained, no build. To run: any static server, e.g. `python3 -m http.server 8642` in the repo root → `http://localhost:8642/demo-map/` (server from the session was stopped; restart it). Needs internet (CDN + tiles).

- Custom MapLibre style written from scratch: paper background, grain via inline-SVG `feTurbulence` overlay, ink roads, OMT `building` layer as pale extrusions (`render_height`), neighborhood labels (`Noto Sans Italic` — OpenFreeMap glyphs only ship Noto stacks).
- 5 fake listings in a `LISTINGS` array: 3 exact (black extrusions + floating price `symbol` labels), 1 plot (Панчарево; hatched `fill-pattern` from a runtime canvas image + dashed outline), 1 approximate (Иван Вазов; dotted circle). Helper fns: `rect()`, `poly()` (meter-offset footprints), `circle()`.
- Listing 3 (Изток) demonstrates a **multi-part "blueprint" footprint**: L-shaped wings + corner tower + set-back penthouse via per-feature `base`/`height` on `fill-extrusion`.
- Comic-styled popups (overridden `.maplibregl-popup-content`), sidebar cards with `flyTo`, hand-tint toggle button (`setPaintProperty` between `TINTS.mono`/`TINTS.tinted` palettes).
- **Gotcha fixed once already:** the MapLibre global is `maplibregl`, not `maplibre`.
- **Font gotcha:** the demo's UI uses Patrick Hand, which has **no Cyrillic** — Bulgarian text falls back to a generic cursive. The presentation uses **Neucha + Caveat, both with Cyrillic** — prefer those for any future on-brand UI.
- In production, listing footprints should snap to real OSM building outlines (manual pick during listing entry).

## 6. The client presentation

`presentation/index.html` — 8 slides, Bulgarian, scroll-snap navigation, built deliberately in the project's own aesthetic (the deck *demonstrates* the concept). Slides: title → problem (all agency sites look alike) → the idea (three paths) → both comic scripts as panel strips → visual style + swatches → the ink map (with inline SVG sketch) → site structure → **five feedback questions for the client** + next step. Print styles included (one slide per page).

- PDF regeneration (after edits), with a static server running:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="presentation/Brokerski-podhod-koncepcia.pdf" --virtual-time-budget=8000 "http://localhost:8642/presentation/"`
  (Remember to also refresh the `Brokerski-podhod-koncepcia.html` copy if `index.html` changes.)
- Recommended sending strategy (agreed): email the **PDF**, mention the interactive version exists → excuse for a live meeting showing the HTML deck + map demo.

## 7. Open items / immediate next steps

1. **Presentation not yet sent.** The title/last slide has **no sender contact details** — user was asked to provide name/phone/email to add before sending; then regenerate the PDF.
2. **⏳ Client feedback is the gate** for everything downstream (art direction, first showcase properties). The deck ends with 5 questions: style fit, story accuracy, which properties first, blueprints/3D models available, team photos willingness.
3. **GitHub Pages** — user asked; answer: yes, works as-is (static, CDN+OpenFreeMap+Google Fonts all fine). Offered but not yet executed: `git init`-was-done/commit, create public repo (suggested name `brokerski-podhod`) via `gh`, push, enable Pages → live URLs for `demo-map/` and `presentation/`. **Caveat told to user: free Pages requires a public repo.** This also gives link-based sending of the presentation.
4. **Next build task (roadmap step 4):** scrollytelling prototype of the apartment story — placeholder panel sketches, real Bulgarian bubble text, GSAP ScrollTrigger, mobile snap fallback — to validate before commissioning final artwork.
5. **Artwork production risk to manage:** character consistency across ~12 panels → lock character sheets (suited agent, casual client couple) before producing panels.

## 8. Design principles to preserve (quick reference)

- Paper `#eae5d9`, ink `#141414`; never pure white; grain texture everywhere.
- Comic boxes: 3px solid black border + offset black shadow (`box-shadow: 5–8px 5–8px 0 #141414`), Caveat for display, Neucha for body (Cyrillic-safe).
- Comics strictly monochrome; map may use the two approved washes only.
- Black on the map is reserved for properties for sale.
- One visual world across the whole site — the main site must not feel generic after the comic intro.
