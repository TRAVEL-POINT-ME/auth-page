/**
 * Everything scene 1 says, in one place, so the markup's resting state and the
 * sequence that fills it in cannot describe different searches.
 */

export const DESTINATION_PLACEHOLDER = 'Search by city or hotel';
export const DATES_PLACEHOLDER = 'Add dates';

/*
 * Typing is chunked rather than per-character on purpose: a caret that lands
 * on syllables reads as a person typing, one that ticks per glyph reads as a
 * teletype. The chunks are uneven for the same reason.
 */
export const DESTINATION_CHUNKS = ['To', 'k', 'y', 'o'] as const;

/** What the date picker hands back — filled in one go, never typed. */
export const DATES_VALUE = '12–14 Dec 2026';

export const PROPERTY_RATINGS = [
  '1 star',
  '2 stars',
  '3 stars',
  '4 stars',
  '5 stars',
] as const;

export const MEAL_TYPES = ['RO', 'BB', 'CB', 'HB', 'FB', 'AI'] as const;

/** The order the sequence picks them in, not just which ones end up picked. */
export const CHIP_PICKS = ['rating:4 stars', 'rating:5 stars', 'meal:BB'] as const;
