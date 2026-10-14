# Sonar Development Company — website

Real estate website for Sofia, Bulgaria (project codename **„Брокерски подход“**). Built with [Astro](https://astro.build), with a 3D "ink city" property map (MapLibre GL + OpenFreeMap tiles + three.js landmarks).

- Live: https://val3ri.github.io/brokerski-podhod/
- Project plan and design decisions: [Planning.md](Planning.md)
- Session handoff (decision log, gotchas): [CONTEXT-HANDOFF.md](CONTEXT-HANDOFF.md)

## Requirements

- **Node.js 22.12 or newer** (check with `node -v`). Install it from [nodejs.org](https://nodejs.org) or with Homebrew: `brew install node`.
- An internet connection when you run the site. The map tiles, map fonts and Google Fonts load from CDNs.

## Run it locally

```bash
npm install        # first time only (and after package.json changes)
npm run dev        # starts the dev server with live reload
```

Then open **http://localhost:4321/brokerski-podhod/**. Note the `/brokerski-podhod/` part: the site is built for a GitHub Pages sub-path (see `base` in `astro.config.mjs`), so the bare `localhost:4321/` shows a 404.

Stop the server with `Ctrl+C`.

## Other commands

| Command | What it does |
|---|---|
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally, to check the production build |

## Deploying

Every push to `main` builds and deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`). There's no manual step.

## Where things are

```
src/
├── pages/                  # every file = a URL
│   ├── index.astro         # homepage (hero, team, services, buildings, map teaser, contacts)
│   ├── imoti/              # /imoti — full-screen 3D property map with filters
│   ├── obekti/[slug].astro # /obekti/sgrada-a … — one page per building (viewer on top)
│   │   └── [suite].astro   # /obekti/sgrada-a/m1 … — one page per apartment
│   └── istoria/            # /istoria/apartament, /istoria/parcel — comic stories (not built yet)
├── data/buildings.ts       # ⭐ ALL buildings/plots: names, status, apartments, prices, map location
├── components/             # Header, Footer, Hero (orbiting map), PropertyMap, …
├── layouts/Layout.astro    # <head>, fonts, Open Graph tags
└── styles/global.css       # colors and fonts (CSS variables at the top)
public/models/              # 3D landmark models (Alexander Nevsky, CC BY 4.0)
presentation/               # old client pitch deck (standalone HTML/PDF, not part of the site)
```

### Adding or editing a building

Everything comes from `src/data/buildings.ts`. The homepage grid, the detail pages and the map all read from it. To add one, copy an existing entry and change:

- `slug`: the URL (`/obekti/<slug>`), latin letters and dashes only
- `type`: `'building'` or `'plot'`
- `neighborhood`: used by the map filter
- `images`: import photos from `src/assets/<slug>/`
- `suites`: the apartments. Each one gets its own page automatically.
- `map`: its location (`lon`/`lat`) and how it's drawn:
  - `box: { w, d, h }` for a simple building, in meters
  - `parts: [...]` for a real blueprint footprint (wings, towers, setbacks)
  - `plot: { w, d }` for a plot
  - `approxRadius: 220` to hide the exact address (shows a dotted circle instead)

To get coordinates, right-click the spot in Google Maps and click the numbers at the top of the menu to copy them. Google gives `lat, lon`, so swap them.

### Prices (kept private)

Real prices are **not** in the repo. They live in `src/data/prices.local.ts`, which is gitignored; copy `src/data/prices.example.ts` to start one. When the file exists (your machine, `npm run dev`), prices and payment-scheme tables show. The public GitHub Pages build doesn't have it, so it shows "цена при запитване" (price on request). To make prices public later, move them into `buildings.ts`.

### Floors and apartments

`src/data/buildings.ts` → the `sgrada-a` entry is the complete example.

- **`floors`** lists the building's levels. Each floor has:
  - `number`: 1 = ground floor, -1 = garage
  - `label`: for example `'Етаж 2'`
  - `level`: the architect's кота, for example `'+3.05'`
  - `plan`: the **floor-plan image**, shown when the floor is picked
  - `facade`: the floor's outline on the façade image
  - `units`: each apartment's outline on the floor plan
- **`suites`** are the apartments. Each one has:
  - `floors`: the floors it occupies. A maisonette has two, for example `[1, 2]`.
  - `status`: `'available'`, `'reserved'` or `'sold'`
  - `price` (the lowest price, shown as "от …")
  - `details`: rows on the apartment page, such as нето, веранда or двор
  - `plan`: the apartment's own plan image
  - `schemes`: prices per payment scheme
- When an apartment sells, change its `status` and push.

**Floor plans from the architect's PDFs:** `scripts/clean-floor-plans.py` turns an ArchiCAD PDF into a buyer-friendly plan. It keeps the walls (in Sonar teal), doors, windows, stairs, bathrooms and furniture, and drops the dimensions, axes, hatching and technical text. It also writes the room names and m² to a `.rooms.json` next to the image, which the site shows as live text. It needs PyMuPDF (`pip install pymupdf`):

```bash
python3 scripts/clean-floor-plans.py "sonar-files/архитектура сграда А =PDF/4 СГРАДА А РАЗПРЕДЕЛЕНИЕ КОТА +3.05.pdf" src/assets/sgrada-a/floor-2
```

It uses the same crop for every floor, so the apartment outlines in `buildings.ts` stay valid. The layer names it keeps are listed at the top of the script, and other architects' PDFs may need them adjusted.

**Visualisations of each floor (optional):** an AI-rendered version of the floor plan, shown by default with a "Визуализация / План" switch.
1. Make the input: `python3 scripts/align-render.py --make-input src/assets/<slug>/floor-N.png <input.png>`.
2. Generate the render with an AI image tool. The prompt is in `sonar-files/ai-renders/PROMPT.md`, and the key instruction is to keep the walls, doors and windows exactly in place.
3. Align it back onto the plan: `python3 scripts/align-render.py src/assets/<slug>/floor-N.png <render.png> src/assets/<slug>/render-floor-N.jpg`. Open the `.check.jpg` it writes: the red plan walls must sit on the render's walls. If the AI reframed the image a lot, add `--init scale,tx,ty --roi x0,y0,x1,y1`; see the script's docstring.
4. Set `render:` on that floor in `buildings.ts`. The apartment outlines then fit the render too.
5. Always compare the render with the plan. AI can move a door or invent a wall. The site labels renders "Илюстративна визуализация".

The scripts need `pip install opencv-python-headless numpy pillow`.

## 3D models (the viewer on `/obekti/<slug>`)

The top of each building page is a viewer. You click a floor, then an apartment, and the apartment's details appear underneath. Set it with the building's `viewer` field. It uses the first option that's set:

| Field | What you upload | When to use it |
|---|---|---|
| `model: 'models/<slug>/building.glb'` | A **`.glb`** file in `public/models/<slug>/` | You have the architect's 3D model |
| `procedural: { floors, width, depth }` | Nothing. A simple block model is generated from the apartments | Placeholder until a real model exists |
| `image` (+ `facade` outlines on each floor) | A façade render or photo (`.jpg`/`.webp` in `src/assets/<slug>/`) | No 3D model. Also the **automatic fallback** when a phone has no WebGL or the model fails to load |

If a building has both a model and an image, a **3D / Снимка** switch appears.

### The .glb file

- **Format:** `.glb` (binary glTF, one self-contained file). Revit, ArchiCAD, SketchUp and Blender can all export glTF. FBX/OBJ need converting in Blender first (*File → Import*, then *File → Export → glTF 2.0*, and pick "glTF Binary").
- **Units:** meters, with Y pointing up (the glTF standard).
- **Size:** aim for **under 5 MB**. Delete the interiors, furniture and hidden geometry first. You don't need textures, because the viewer draws everything in the site's ink style anyway.
- **Naming, which is what makes it clickable.** In Blender's outliner (or the architect's export), name the objects:
  - `floor_1`, `floor_2`, … for a group or object holding everything on that floor (1 = ground floor)
  - `unit_<number>` for each apartment, where `<number>` is the `number` in `buildings.ts`. For example, `unit_7` opens apartment 7.
  - Anything else (stairs, roof, terraces) can have any name. It's drawn as plain building.
- A **house or single apartment** can skip the naming. The model then just rotates, and floor picking is hidden.

### A 2D building with clickable floors and floor plans

This works without any 3D model. The façade image shows the building, clicking a floor opens its floor plan, and clicking an apartment on the plan shows its card and links to its page. `facade` (on the façade image) and `units` (on the floor plan) are polygons. Points are **percent of the image** (`[x, y]`, from 0 to 100, measured from the top-left). The easiest way to get them is to open the image in any editor, read the pixel positions of each floor's corners, and divide by the image width or height.

### Libraries

[three.js](https://threejs.org) renders the viewer (`GLTFLoader` loads the models and `OrbitControls` handles rotating and zooming). It's already a dependency, and it's only downloaded on pages that actually show 3D. The code is in `src/scripts/viewer3d.ts` (3D) and `src/components/PropertyViewer.astro` (floor panel, 2D image and fallback).
