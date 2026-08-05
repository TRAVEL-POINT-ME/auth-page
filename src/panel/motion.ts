import type { CSSProperties } from 'react';

/**
 * The panel's motion vocabulary.
 *
 * JS owns the numbers and writes them onto the panel element as custom
 * properties; `motion.css` reads them. A beat sheet in `*.sequence.ts` and the
 * transition that beat triggers therefore cannot drift apart, and the review
 * rate divides both at once.
 */

export const MOTION = {
  /** Field focus change, chip selection. */
  micro: 180,
  /** The submit button going down, and coming back up. */
  pressDown: 140,
  pressUp: 160,
  /**
   * A filter chip being tapped. The finger goes down fast and the chip comes
   * back slowly through an overshoot, which is the asymmetry a real press has:
   * the push is the user's, the return is the material's.
   */
  chipDown: 110,
  chipUp: 280,
  /** The search form dissolving. */
  formOut: 380,
  /** The map's opacity, scale and blur. Deliberately three lengths — see below. */
  mapFade: 540,
  mapScale: 1500,
  mapBlur: 420,
  /** One pin's drop, and the ripple it sets off. */
  pinDrop: 580,
  pinRipple: 700,
  /**
   * One stagger unit between pins. Each pin's delay is its own `beat` times
   * this, and the beats are fractional and uneven — see `discovery.data.ts`.
   */
  staggerPin: 200,
  /** The status pill arriving over the map, and leaving before the stack. */
  statusIn: 420,
  statusOut: 260,
  /** The cross-fade from "searching" to the result inside it. */
  statusSwap: 260,
  /** One pass of the shimmer across the label. */
  shimmer: 2000,
  /**
   * A notification card appearing, and the stack recoiling under it. Both are
   * slower than the panel's other entrances: three cards arriving in a row is
   * the one beat in the scene where the viewer is being asked to read rather
   * than to watch.
   */
  cardIn: 340,
  stackShift: 420,
  /**
   * How far ahead of a new card the stack starts moving. The gap opens first
   * and the card drops into it — displacement, rather than a card materialising
   * on top of the one it is supposed to be pushing.
   */
  stackLead: 150,
  /** Between consecutive notifications. */
  staggerCard: 820,
  /** A chat message entering its final slot. */
  expertMessageIn: 300,
  /** One loop and one phase step of the support typing indicator. */
  expertTyping: 1000,
  expertTypingStagger: 150,
  /** Scene cross-fade, and the switcher's pill. */
  scene: 420,
  pill: 250,
} as const;

export const EASE = {
  /** Strong ease-out. Entrances and exits. */
  out: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** Strong ease-in-out. Things already on screen moving from A to B. */
  move: 'cubic-bezier(0.77, 0, 0.175, 1)',
  /** iOS-like deceleration (Ionic's drawer curve). The map settling. */
  map: 'cubic-bezier(0.32, 0.72, 0, 1)',
  /**
   * `easeOutBack` (easings.net). The only curve here that overshoots, and it is
   * spent on one thing: a chip coming back up after a tap. Physical material
   * rebounds past its resting point; nothing else in the panel should.
   */
  back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

/**
 * The map's three properties run at three different lengths on purpose: the
 * fade finishes while the scale is still settling, which is what reads as
 * "arrived, then came to rest" rather than "faded in at a size".
 */
export function motionVars(rate: number): CSSProperties {
  const vars: Record<string, string> = {
    '--dur-micro': `${MOTION.micro / rate}ms`,
    '--dur-press-down': `${MOTION.pressDown / rate}ms`,
    '--dur-press-up': `${MOTION.pressUp / rate}ms`,
    '--dur-chip-down': `${MOTION.chipDown / rate}ms`,
    '--dur-chip-up': `${MOTION.chipUp / rate}ms`,
    '--dur-form-out': `${MOTION.formOut / rate}ms`,
    '--dur-map-fade': `${MOTION.mapFade / rate}ms`,
    '--dur-map-scale': `${MOTION.mapScale / rate}ms`,
    '--dur-map-blur': `${MOTION.mapBlur / rate}ms`,
    '--dur-pin-drop': `${MOTION.pinDrop / rate}ms`,
    '--dur-pin-ripple': `${MOTION.pinRipple / rate}ms`,
    /* The pins' stagger is a CSS `animation-delay` rather than a JS beat: six
       one-shot drops fired by a single class, so nothing per-pin is scheduled. */
    '--dur-pin-stagger': `${MOTION.staggerPin / rate}ms`,
    '--dur-status-in': `${MOTION.statusIn / rate}ms`,
    '--dur-status-out': `${MOTION.statusOut / rate}ms`,
    '--dur-status-swap': `${MOTION.statusSwap / rate}ms`,
    '--dur-shimmer': `${MOTION.shimmer / rate}ms`,
    '--dur-card-in': `${MOTION.cardIn / rate}ms`,
    '--dur-stack-shift': `${MOTION.stackShift / rate}ms`,
    '--dur-expert-message': `${MOTION.expertMessageIn / rate}ms`,
    '--dur-expert-typing': `${MOTION.expertTyping / rate}ms`,
    '--dur-expert-typing-stagger': `${MOTION.expertTypingStagger / rate}ms`,
    '--dur-scene': `${MOTION.scene / rate}ms`,
    '--dur-pill': `${MOTION.pill / rate}ms`,
    '--ease-stage-out': EASE.out,
    '--ease-stage-move': EASE.move,
    '--ease-stage-map': EASE.map,
    '--ease-stage-back': EASE.back,
  };
  return vars as CSSProperties;
}
