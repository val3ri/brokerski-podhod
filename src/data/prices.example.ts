// Template for prices.local.ts (which is gitignored — real prices never go into the public repo).
// Copy to prices.local.ts and fill in. Amounts are numbers in €; keys are building slugs and
// suite numbers from buildings.ts. Anything missing simply shows "цена при запитване".
import type { PriceData } from './buildings';

export const prices: PriceData = {
  'building-slug': {
    priceFrom: 100000,
    suites: {
      // split = % paid at [предварителен договор, Акт 14, Акт 15, Акт 16]; null = nothing at that stage
      a1: { price: 100000, schemes: [{ split: [80, 10, null, 10], perM2: 2000, total: 100000 }] },
    },
  },
};
