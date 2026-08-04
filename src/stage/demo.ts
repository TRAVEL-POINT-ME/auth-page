/**
 * The demo's content, in one place.
 *
 * Scenes 2, 3 and 4 all show the same net rate, and scenes 1 and 3 both name
 * the same destination. Nothing below is repeated in a component — every
 * displayed figure is either read from here or derived from it, so the three
 * cards cannot drift apart.
 *
 * Nothing here is generated at runtime. The demo is shown repeatedly in sales
 * conversations and has to look identical every time, so the quote spread is a
 * hardcoded table and the two "organic" qualities of scene 2 — where each dot
 * sits vertically, and the order the dots arrive in — come from index
 * arithmetic rather than `Math.random`.
 */

export const DEMO = {
  destination: 'Osaka, Japan',
  /** Typed into the destination field in four chunks, not per character. */
  destinationChunks: ['Osa', 'Osak', 'Osaka', 'Osaka, Japan'],
  dateRange: '08/10/2026 – 11/10/2026',
  /** 08/10 -> 11/10. Figma's cards read "2 nights"; the date range is 3. */
  nights: 3,

  /** Scene 2, first counter. */
  sourcesChecked: 188,

  /** Scene 2 best label, scene 3 total, scene 4 first row. */
  netRate: 253.14,

  /** Scene 4. */
  markupPct: 12,

  /**
   * The 28 quotes scene 2 plots, ascending. `spread[0]` is the net rate — the
   * quote that wins — and the last entry is the top of the range. The values
   * reproduce the distribution Figma draws: dense at the cheap end, thinning
   * out towards the expensive one.
   */
  spread: [
    253.14, 259.38, 265.83, 270.75, 277.13, 280.18, 284.48, 289.47, 291.83,
    293.77, 296.4, 301.12, 303.47, 308.47, 310.82, 315.82, 320.39, 324.83,
    329.68, 334.4, 341.05, 347.15, 351.59, 356.16, 364.07, 373.5, 381.54, 391.8,
  ],

  property: {
    name: 'lyf Shibuya Tokyo',
    stars: 4,
    address: '4 3 Udagawacho Shibuya Ku, Osaka, Japan',
    freeCancellationUntil: '28 Sep',
  },

  support: {
    bookingRef: '1148213',
    agent: 'Anastasia S.',
    agentInitials: 'NS',
    sentAt: '23:18',
    arrival: '01:40',
  },
} as const;

/** Scene 2's second counter. Never written down separately. */
export const liveRates = DEMO.spread.length;

/** Scene 4, row 3. */
export const clientPrice = DEMO.netRate * (1 + DEMO.markupPct / 100);

/** Scene 4, the payoff line. */
export const margin = clientPrice - DEMO.netRate;

/** Every price in the demo is a euro figure with two decimals. */
export function euro(value: number) {
  return `€${value.toFixed(2)}`;
}

/** "3 nights" / "1 night". */
export function nights(count: number) {
  return `${count} night${count === 1 ? '' : 's'}`;
}

// ---- Scene 2 geometry ------------------------------------------------------

/**
 * Where a quote sits along the track, as a percentage of its width. The
 * cheapest maps to 10% and the dearest to 92% — the margin at each end is what
 * keeps the best-rate label, which is centred on the winning dot, from
 * clipping the card edge.
 */
export function quoteOffsetPct(index: number) {
  const first = DEMO.spread[0];
  const last = DEMO.spread[DEMO.spread.length - 1];
  return 10 + ((DEMO.spread[index] - first) / (last - first)) * 82;
}

/**
 * The dots do not sit on one line — they scatter across a four-level band,
 * 7px apart, cycling in index order. The winner takes the lowest level so the
 * label above it has room.
 */
const BAND_LEVELS = [38, 45, 52, 59];

export function quoteBandY(index: number) {
  return index === 0 ? BAND_LEVELS[3] : BAND_LEVELS[index % BAND_LEVELS.length];
}

/** The point every dot converges on at the end of scene 2. */
export const BAND_CENTRE_Y = (BAND_LEVELS[0] + BAND_LEVELS[3]) / 2;

/**
 * The order the dots land in. Revealing them in price order wipes across the
 * card left to right, which reads as a progress bar rather than as replies
 * coming back from 188 different places. Sorting the indices by `(i * 11) % 28`
 * scrambles them — 11 and 28 are coprime, so every index appears exactly once.
 */
export const arrivalOrder = DEMO.spread
  .map((_, index) => index)
  .sort((a, b) => ((a * 11) % liveRates) - ((b * 11) % liveRates));
