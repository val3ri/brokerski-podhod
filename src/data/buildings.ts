// Shared by the homepage "Обекти" grid and the /obekti/[slug] (+ /obekti/[slug]/[suite])
// detail pages — one source of truth so all of them stay in sync.
// TODO: реални имена, статуси, описания, локации, апартаменти — виж плейсхолдърите по-долу.
import type { ImageMetadata } from 'astro';
import b1_1 from '../assets/buildings/b1-1.jpg';
import b1_2 from '../assets/buildings/b1-2.jpg';
import b2_1 from '../assets/buildings/b2-1.jpg';
import b3_1 from '../assets/buildings/b3-1.jpg';

export interface Suite {
  number: string;
  type: string;
  size: string;
}

export interface Building {
  slug: string;
  name: string;
  status: string;
  images: ImageMetadata[];
  suites: Suite[];
}

export const buildings: Building[] = [
  {
    slug: 'obekt-1', name: 'Обект 1', status: 'В строеж', images: [b1_1, b1_2],
    suites: [
      { number: '1', type: '1-стаен', size: '45 м²' },
      { number: '2', type: '2-стаен', size: '68 м²' },
      { number: '3', type: '3-стаен', size: '92 м²' },
      { number: '4', type: 'Мезонет', size: '140 м²' },
    ],
  },
  {
    slug: 'obekt-2', name: 'Обект 2', status: 'Продава се', images: [b2_1],
    suites: [
      { number: '1', type: '1-стаен', size: '42 м²' },
      { number: '2', type: '2-стаен', size: '65 м²' },
      { number: '3', type: '3-стаен', size: '88 м²' },
    ],
  },
  {
    slug: 'obekt-3', name: 'Обект 3', status: 'Завършен', images: [b3_1],
    suites: [
      { number: '1', type: '2-стаен', size: '70 м²' },
      { number: '2', type: '3-стаен', size: '95 м²' },
    ],
  },
  { slug: 'obekt-4', name: 'Обект 4', status: 'Нов проект', images: [], suites: [] },
];
