// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project-page URL (val3ri/brokerski-podhod → served at this subpath).
  // If a custom domain is set up later, drop `base` entirely and update `site` to the domain.
  site: 'https://val3ri.github.io',
  // trailing slash matters: it's what makes import.meta.env.BASE_URL end in '/' everywhere we
  // build paths as `${base}imoti` etc. — without it those come out as "...podhodimoti" (missing separator).
  base: '/brokerski-podhod/',
});
