/**
 * Everything scene 1 says, in one place, so the markup's resting state and the
 * sequence that fills it in cannot describe different searches.
 */

import petIcon from '../../assets/icons/notif-pet.svg';
import shieldIcon from '../../assets/icons/notif-shield.svg';
import transferIcon from '../../assets/icons/notif-transfer.svg';

export const DESTINATION_PLACEHOLDER = 'Search by city or hotel';

/** One burst of typing, and the pause that follows it. */
export type TypedChunk = { text: string; hold: number };

/*
 * The destination, typed.
 *
 * Chunked rather than per-character, and — more importantly — chunked at
 * uneven lengths with an uneven pause after each. A constant interval is the
 * one thing that gives simulated typing away no matter how fast it runs: real
 * hands rattle through the letters they already know and stop at the ones they
 * are still deciding.
 *
 * The shape of this particular run: a normal start, the middle of the word
 * thrown away, a think at the end of "Tokyo", a beat on the comma — the longest
 * pause here, because punctuation is where a typist checks what they have — and
 * then the country in two quick bursts. City and country are one continuous
 * run; nothing about the country is autocompleted.
 */
export const DESTINATION_CHUNKS: readonly TypedChunk[] = [
  { text: 'To', hold: 170 },
  { text: 'ky', hold: 115 },
  { text: 'o', hold: 345 },
  { text: ',', hold: 230 },
  { text: ' Ja', hold: 140 },
  { text: 'pan', hold: 0 },
];

/** The whole value once the field has settled. */
export const DESTINATION_VALUE = DESTINATION_CHUNKS.map((c) => c.text).join('');

/**
 * The dates field is filled before the scene starts — it is not a beat. The
 * search the panel is playing back is "where", and a date range that types
 * itself in would be a second thing to read at the moment the city lands.
 */
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

/* ---- The search status pill (Figma 20770:951) -------------------------- */

/**
 * What the pill says while the map fills in, and what it says once it has.
 *
 * Two labels rather than one node whose text is rewritten: they cross-fade, and
 * only the first one shimmers — a result that keeps sweeping would read as
 * still loading.
 */
export const SEARCH_STATUS = {
  searching: 'Searching for hotels...',
  found: '2,500 properties found',
} as const;

/* ---- Pins -------------------------------------------------------------- */

/*
 * `x` and `y` are where the pin *points*, as a percentage of the map asset —
 * not of the panel. The cover box is built to the asset's ratio, so a
 * percentage of it lands on the same junction at every viewport shape, which is
 * the whole reason the pins live inside the map layer rather than the stage.
 *
 * Two things constrain where a pin can go, both of them measurable from the
 * panel rather than matters of taste:
 *
 *   - the map is wider than the panel, so roughly the outer 11% of the asset on
 *     each side is cropped away and nothing may be placed there;
 *   - the vignette starts washing at 74% of the way out from the centre, so a
 *     pin past that fades with the map's edge.
 *
 * They also keep clear of the notification stack, which covers the middle of
 * the panel from 38% to 62% of its height once it has assembled.
 *
 * `size` is the pin's frame in Figma; the art drawn inside it is inset —
 * 15.625% each side, 9.375% top, 6.25% bottom. Positioning the drawn box, and
 * not the frame, is what puts `transform-origin: 50% 100%` on the point of the
 * pin, so the squash happens where it touches down.
 */
const PIN_ART = { w: 0.6875, h: 0.84369 };

type PinSpec = {
  id: string;
  x: number;
  y: number;
  size: number;
  /**
   * When the pin drops, counted in stagger units rather than milliseconds — the
   * CSS multiplies it by `--dur-pin-stagger`, so the rate control still divides
   * it and there is nothing per-pin on the timeline.
   *
   * Deliberately not the array index. Six landings spaced exactly alike read as
   * a metronome; uneven gaps read as results coming back.
   */
  beat: number;
};

/*
 * Scattered, not arranged. The earlier set paired pins across the panel — two
 * at the same height on the left and right, three times over — which drew a
 * ring around the middle of the map and read as a diagram.
 *
 * No two share a height or a distance from the centre now, and the array order
 * (which is drop order) jumps across the map rather than sweeping down it.
 *
 * The three constraints from the panel still hold, and they are tighter than
 * they look. The asset is 28% wider than the panel, so a percentage of it maps
 * to `1.28x - 14` of the panel: x must stay inside 23–76% of the asset or the
 * pin lands within a few percent of the panel's edge, where the vignette is
 * already washing. The notification stack then takes x 29–71% at y 38–62% out
 * of what is left — which is why the only two mid-height slots are the slivers
 * either side of it, and why those two are the pins that most have to differ in
 * height from each other.
 */
const PIN_SPECS: readonly PinSpec[] = [
  { id: 'a', x: 63.5, y: 14.8, size: 32, beat: 0 },
  { id: 'b', x: 24.8, y: 44.5, size: 24, beat: 0.9 },
  { id: 'c', x: 70.1, y: 71.6, size: 22, beat: 1.7 },
  { id: 'd', x: 34.9, y: 26, size: 18, beat: 2.8 },
  { id: 'f', x: 45.2, y: 80.3, size: 26, beat: 3.5 },
  { id: 'e', x: 74.2, y: 55.8, size: 20, beat: 4.6 },
];

/** The last pin's beat — what the sequence waits out before the pill answers. */
export const LAST_PIN_BEAT = Math.max(...PIN_SPECS.map((pin) => pin.beat));

export type Pin = {
  id: string;
  /** Ready for `style` — percentages of the map box, offset to the pin's point. */
  left: string;
  top: string;
  width: string;
  height: string;
  beat: number;
};

export const PINS: readonly Pin[] = PIN_SPECS.map(({ id, x, y, size, beat }) => {
  const width = size * PIN_ART.w;
  const height = size * PIN_ART.h;
  return {
    id,
    left: `calc(${x}% - ${width / 2}px)`,
    top: `calc(${y}% - ${height}px)`,
    width: `${width}px`,
    height: `${height}px`,
    beat,
  };
});

/* ---- Notifications ----------------------------------------------------- */

/**
 * How far one arrival pushes the stack down — the card height plus the gap,
 * i.e. `--notif-h + --notif-gap`. The sequence writes it straight onto a slot's
 * `transform`, so it has to exist as a number here as well as a token there.
 */
export const NOTIF_STEP = 76;

export type Notification = {
  id: string;
  icon: string;
  /** The glyph's colour, shared with the bullet, and the tile behind it. */
  tint: string;
  tray: string;
  title: string;
  detail: string;
  time: string;
};

/*
 * Arrival order, oldest first — which is also bottom-to-top in the finished
 * stack, and the order a booking actually resolves in: the room is verified,
 * then the transfer against it, then the extras on top.
 *
 * The timestamps have to follow that order, not the cards: whatever lands first
 * is the one that has been sitting there longest by the time the stack is
 * built, so "12m" belongs to the confirmation and "now" to the pet amenities.
 */
export const NOTIFICATIONS: readonly Notification[] = [
  {
    id: 'hotel',
    icon: shieldIcon,
    tint: 'var(--c-notif-verified)',
    tray: 'var(--c-notif-verified-tray)',
    title: 'Hotel confirmation verified',
    detail: 'HCN 1711-94 · auto-synced to your voucher',
    time: '12m',
  },
  {
    id: 'transfer',
    icon: transferIcon,
    tint: 'var(--c-notif-travel)',
    tray: 'var(--c-notif-travel-tray)',
    title: 'Round-trip transfer confirmed',
    detail: 'NRT 08:00, Dec 12 → hotel → NRT 17:00, Dec 14',
    time: '4m',
  },
  {
    id: 'pet',
    icon: petIcon,
    tint: 'var(--c-notif-travel)',
    tray: 'var(--c-notif-travel-tray)',
    title: 'Pet amenities confirmed',
    detail: 'Bowls, bed & treats ready · booking №1719068',
    time: 'now',
  },
];
