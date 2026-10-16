// Shared by the homepage "Обекти" grid, the /obekti/[slug] (+ /obekti/[slug]/[suite]) detail pages
// and the /imoti map — one source of truth so all of them stay in sync.
// TODO: реални имена, статуси, описания, локации, апартаменти — виж плейсхолдърите по-долу.
import type { ImageMetadata } from 'astro';
// Sonar Residence, Сграда А — from the client's catalogue + architect's plans (sonar-files/, not in git)
import aFacade from '../assets/sgrada-a/facade.jpg';
import aRender1 from '../assets/sgrada-a/render-1.jpg';
import aRender2 from '../assets/sgrada-a/render-2.jpg';
import aRender3 from '../assets/sgrada-a/render-3.jpg';
import aFloorG from '../assets/sgrada-a/floor-garage.png';
import aFloor1 from '../assets/sgrada-a/floor-1.png';
import aFloor2 from '../assets/sgrada-a/floor-2.png';
import aFloor3 from '../assets/sgrada-a/floor-3.png';
import aTech1 from '../assets/sgrada-a/floor-1-tech.png';
import aTech2 from '../assets/sgrada-a/floor-2-tech.png';
import aTech3 from '../assets/sgrada-a/floor-3-tech.png';
import aRender1F from '../assets/sgrada-a/render-floor-1.jpg';
import aRender2F from '../assets/sgrada-a/render-floor-2.jpg';
import aRender3F from '../assets/sgrada-a/render-floor-3.jpg';
import aRooms1 from '../assets/sgrada-a/floor-1.rooms.json';
import aRooms2 from '../assets/sgrada-a/floor-2.rooms.json';
import aRooms3 from '../assets/sgrada-a/floor-3.rooms.json';
import aPlanM1 from '../assets/sgrada-a/plan-m1.png';
import aPlanM2 from '../assets/sgrada-a/plan-m2.png';
import aPlanM3 from '../assets/sgrada-a/plan-m3.png';
import aPlanM4 from '../assets/sgrada-a/plan-m4.png';
import aPlanM5 from '../assets/sgrada-a/plan-m5.png';
import aPlanA1 from '../assets/sgrada-a/plan-a1.png';
import aPlanA2 from '../assets/sgrada-a/plan-a2.png';
import aPlanA3 from '../assets/sgrada-a/plan-a3.png';

export type SuiteStatus = 'available' | 'reserved' | 'sold';

export const STATUS_LABEL: Record<SuiteStatus, string> = {
  available: 'Свободен',
  reserved: 'Резервиран',
  sold: 'Продаден',
};

// price per payment scheme: % paid at [предварителен договор, Акт 14, Акт 15, Акт 16]
export interface PaymentScheme {
  split: [number | null, number | null, number | null, number | null];
  perM2?: number;
  total?: number;
}

export interface Suite {
  number: string;   // unique within the building; also the URL (/obekti/<slug>/<number>) and the
                    // 3D model node name (unit_<number>) — see README "3D models"
  name?: string;    // display name, e.g. 'Мезонет 01' (default: 'Апартамент №<number>')
  type: string;
  size: string;
  floors: number[]; // floor numbers it occupies (see Building.floors) — a maisonette has two
  status: SuiteStatus;
  price?: string;
  details?: [string, string][];   // extra rows on the apartment page (нето, веранда, двор…)
  plan?: ImageMetadata;           // the apartment's own plan
  schemes?: PaymentScheme[];
}

// One level of the building. `number` is what apartments refer to (1 = ground floor, -1 = garage).
// Outlines are polygons in % of their image ([x, y], 0–100 from the top-left).
export interface Floor {
  number: number;
  label: string;                  // 'Етаж 1', 'Гараж'
  level?: string;                 // architect's кота, e.g. '+3.05'
  plan?: ImageMetadata;           // whole-floor plan, shown when the floor is picked
  technical?: ImageMetadata;      // the architect's drawing with all dimensions, same crop as `plan`
                                  // (scripts/clean-floor-plans.py → *-tech.png) — the „План“ view
  render?: ImageMetadata;         // illustrative (AI) visualisation of the plan, aligned to it
                                  // pixel-for-pixel (scripts/align-render.py) — same outlines apply
  facade?: [number, number][];    // this floor's outline on viewer.image (the 2D building)
  units?: Record<string, [number, number][]>;   // apartment number → its outline on `plan`
  // room labels drawn as live text on `plan` (from scripts/clean-floor-plans.py → *.rooms.json)
  rooms?: { name: string; area: string | null; x: number; y: number }[];
}

export type PropertyType = 'building' | 'house' | 'apartment' | 'plot';

export const TYPE_LABEL: Record<PropertyType, string> = {
  building: 'сграда',
  house: 'къща',
  apartment: 'апартамент',
  plot: 'парцел',
};

// one extruded volume of a "blueprint" footprint: corner points as meter offsets [east, north]
// from the building's lon/lat, plus its own base/top height — gives wings, towers, setbacks
export interface FootprintPart {
  pts: [number, number][];
  base: number;
  height: number;
}

export interface MapPlacement {
  lon: number;
  lat: number;
  // building footprint — a simple box (w × d meters, h tall) OR multi-part blueprint parts.
  // Ignored for plots and for approximate listings.
  box?: { w: number; d: number; h: number };
  parts?: FootprintPart[];
  // plots: size of the hatched rectangle, meters
  plot?: { w: number; d: number };
  // address privacy (Planning.md §6): set → dotted circle of this radius (m) instead of the
  // exact building, with "точният адрес — при контакт"
  approxRadius?: number;
  // camera for the fly-to when the object is picked from the list
  view: { zoom: number; pitch: number; bearing: number };
}

// The viewer at the top of /obekti/<slug>. Priority: model → procedural → image; if WebGL is
// missing or the model fails to load, it falls back to `image`. See README "3D models".
export interface Viewer {
  // real 3D model: a .glb file under public/, path without leading slash
  model?: string;
  // no model yet → a simple massing model generated from the suites (placeholder until the
  // architect's model arrives). Meters.
  procedural?: { floors: number; width: number; depth: number; floorHeight?: number };
  // 2D building: façade render / photo; floors become clickable through Floor.facade
  image?: ImageMetadata;
}

export interface Building {
  slug: string;
  name: string;
  status: string;
  type: PropertyType;
  neighborhood: string;
  priceFrom?: string;
  description?: string;
  images: ImageMetadata[];
  suites: Suite[];
  floors?: Floor[];   // optional — without it, floors are derived from the suites
  viewer?: Viewer;
  map?: MapPlacement;
}

// Real prices live in prices.local.ts (gitignored, see prices.example.ts) and are merged into the
// buildings below when that file exists — so the public build never contains them.
export type PriceData = Record<string, {
  priceFrom?: number;
  suites?: Record<string, { price?: number; schemes?: PaymentScheme[] }>;
}>;
const localPrices = Object.values(
  import.meta.glob<{ prices: PriceData }>('./prices.local.ts', { eager: true }),
)[0]?.prices ?? {};

export const floorLabel = (floor: number) => floor < 0 ? 'Гараж' : `Етаж ${floor}`;

export const suiteName = (s: Suite) => s.name ?? `Апартамент №${s.number}`;

// '1' or '1–2'
export const floorsText = (s: Suite) =>
  s.floors.length > 1 ? `${Math.min(...s.floors)}–${Math.max(...s.floors)}` : String(s.floors[0]);

// the building's floors, top first; explicit list or one per floor number used by the suites
export function floorsOf(b: Building): Floor[] {
  const list = b.floors ?? [...new Set(b.suites.flatMap((s) => s.floors))]
    .map((n) => ({ number: n, label: floorLabel(n) }));
  return [...list].sort((a, z) => z.number - a.number);
}

export const eur = (n: number) => `${n.toLocaleString('bg-BG')} €`;

// axis-aligned outline helper: rect(x0, y0, x1, y1) in %
const rect = (x0: number, y0: number, x1: number, y1: number): [number, number][] =>
  [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];


export const buildings: Building[] = [
  {
    slug: 'sgrada-a', name: 'Sonar Residence · Сграда А', status: 'В строеж', type: 'building',
    neighborhood: 'Малинова долина',
    description: 'Пет мезонета на две нива с частни дворове и веранди и три апартамента с големи тераси на последния етаж. Подземен гараж. ул. „Професор Юрдан Данчов“, кв. Малинова долина.',
    images: [aFacade, aRender1, aRender2, aRender3],
    viewer: { image: aFacade },
    floors: [
      { number: -1, label: 'Гараж', level: '−3.05', plan: aFloorG,
        facade: rect(0, 77, 11.5, 88) },
      { number: 1, label: 'Етаж 1', level: '±0.00', plan: aFloor1, technical: aTech1, render: aRender1F, rooms: aRooms1,
        facade: rect(11.5, 72.3, 88.6, 85.1),
        units: {
          m1: rect(9, 11.5, 22.4, 81.5),
          m2: rect(22.4, 11.5, 35.7, 81.5),
          m3: rect(35.7, 11.5, 60.2, 60),
          m4: rect(60.2, 11.5, 73.5, 81.5),
          m5: rect(73.5, 11.5, 86.6, 81.5),
        } },
      { number: 2, label: 'Етаж 2', level: '+3.05', plan: aFloor2, technical: aTech2, render: aRender2F, rooms: aRooms2,
        facade: rect(3.8, 52.2, 96.8, 72.3),
        units: {
          m1: rect(2.6, 11.6, 22.9, 81.2),
          m2: [[22.9,11.6],[35.7,11.6],[35.7,52],[49,52],[49,60],[35.7,60],[35.7,81.2],[22.9,81.2]],
          m3: rect(35.7, 11.6, 60.8, 52),
          m4: [[60.8,11.6],[73.9,11.6],[73.9,81.2],[60.8,81.2],[60.8,60],[49,60],[49,52],[60.8,52]],
          m5: rect(73.9, 11.6, 94.3, 81.2),
        } },
      { number: 3, label: 'Етаж 3', level: '+6.10', plan: aFloor3, technical: aTech3, render: aRender3F, rooms: aRooms3,
        facade: [[12.4,39],[87.1,39],[87.1,47.2],[96.5,47.2],[96.5,52.2],[4.2,52.2],[4.2,47.2],[12.4,47.2]],
        units: {
          a1: [[8.1,37],[22.6,37],[22.6,29.8],[35.2,29.8],[35.2,69],[8.1,69]],
          a2: rect(35.2, 23.8, 60.2, 59.7),
          a3: [[60.2,29.8],[73.4,29.8],[73.4,37],[86.6,37],[86.6,69],[60.2,69]],
        } },
    ],
    suites: [
      { number: 'm1', name: 'Мезонет 01', type: 'Мезонет', size: '136,68 м²', floors: [1, 2], status: 'available',
        plan: aPlanM1,
        details: [['Нето', '116,63 м²'], ['Етаж 1 (нето)', '42,47 м²'], ['Етаж 2 (нето)', '74,16 м²'],
          ['Веранди', '94,62 м²'], ['Двор', '57,19 м²'], ['Спални', '3'], ['Бани', '4']] },
      { number: 'm2', name: 'Мезонет 02', type: 'Мезонет', size: '116,12 м²', floors: [1, 2], status: 'sold',
        plan: aPlanM2,
        details: [['Нето', '99,74 м²'], ['Етаж 1 (нето)', '41,04 м²'], ['Етаж 2 (нето)', '58,70 м²'],
          ['Веранди', '13,18 м²'], ['Двор', '27,20 м²'], ['Спални', '2'], ['Бани', '3']] },
      { number: 'm3', name: 'Мезонет 03', type: 'Мезонет', size: '128,74 м²', floors: [1, 2], status: 'sold',
        plan: aPlanM3,
        details: [['Нето', '111,18 м²'], ['Етаж 1 (нето)', '56,91 м²'], ['Етаж 2 (нето)', '54,27 м²'],
          ['Веранда', '12,41 м²'], ['Двор', '49,86 м²'], ['Спални', '2'], ['Бани', '3']] },
      { number: 'm4', name: 'Мезонет 04', type: 'Мезонет', size: '115,21 м²', floors: [1, 2], status: 'available',
        plan: aPlanM4,
        details: [['Нето', '98,97 м²'], ['Етаж 1 (нето)', '41,04 м²'], ['Етаж 2 (нето)', '57,93 м²'],
          ['Веранди', '13,18 м²'], ['Двор', '27,20 м²'], ['Спални', '2'], ['Бани', '3']] },
      { number: 'm5', name: 'Мезонет 05', type: 'Мезонет', size: '136,07 м²', floors: [1, 2], status: 'available',
        plan: aPlanM5,
        details: [['Нето', '116,63 м²'], ['Етаж 1 (нето)', '42,47 м²'], ['Етаж 2 (нето)', '74,16 м²'],
          ['Веранда', '67,77 м²'], ['Двор', '50,81 м²'], ['Спални', '3'], ['Бани', '4']] },
      { number: 'a1', name: 'Апартамент 1', type: '2-стаен', size: '62,27 м²', floors: [3], status: 'sold',
        plan: aPlanA1,
        details: [['Нето', '53,20 м²'], ['Тераси', '65,89 м²']] },
      { number: 'a2', name: 'Апартамент 2', type: '2-стаен', size: '54,43 м²', floors: [3], status: 'available',
        plan: aPlanA2,
        details: [['Нето', '46,97 м²'], ['Тераса', '7,27 м²']] },
      { number: 'a3', name: 'Апартамент 3', type: '2-стаен', size: '62,09 м²', floors: [3], status: 'available',
        plan: aPlanA3,
        details: [['Нето', '53,20 м²'], ['Тераси', '65,89 м²']] },
    ],
    // TODO: точни координати — засега приблизителна зона в Малинова долина
    map: { lon: 23.3385, lat: 42.6455, approxRadius: 300,
      view: { zoom: 14.6, pitch: 50, bearing: 0 } },
  },
];

for (const b of buildings) {
  const p = localPrices[b.slug];
  if (!p) continue;
  if (p.priceFrom) b.priceFrom = eur(p.priceFrom);
  for (const s of b.suites) {
    const sp = p.suites?.[s.number];
    if (sp?.price) s.price = eur(sp.price);
    if (sp?.schemes) s.schemes = sp.schemes;
  }
}
