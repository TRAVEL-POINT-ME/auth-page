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
  /** One chunk of simulated typing. */
  typeChunk: 190,
  /** Field focus change, chip selection. */
  micro: 180,
  /** The submit button going down, and coming back up. */
  pressDown: 140,
  pressUp: 160,
  /** The search form dissolving. */
  formOut: 380,
  /** The map's opacity, scale and blur. Deliberately three lengths — see below. */
  mapFade: 500,
  mapScale: 1100,
  mapBlur: 600,
  /** One pin's drop, and the ripple it sets off. */
  pinDrop: 520,
  pinRipple: 700,
  /** Between consecutive pins landing. */
  staggerPin: 130,
  /** A notification card appearing, and the stack recoiling under it. */
  cardIn: 300,
  stackShift: 360,
  /** Between consecutive notifications. */
  staggerCard: 520,
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
} as const;

/**
 * The map's three properties run at three different lengths on purpose: the
 * fade finishes while the scale is still settling, which is what reads as
 * "arrived, then came to rest" rather than "faded in at a size".
 */
export function motionVars(rate: number): CSSProperties {
  const vars: Record<string, string> = {
    '--dur-type': `${MOTION.typeChunk / rate}ms`,
    '--dur-micro': `${MOTION.micro / rate}ms`,
    '--dur-press-down': `${MOTION.pressDown / rate}ms`,
    '--dur-press-up': `${MOTION.pressUp / rate}ms`,
    '--dur-form-out': `${MOTION.formOut / rate}ms`,
    '--dur-map-fade': `${MOTION.mapFade / rate}ms`,
    '--dur-map-scale': `${MOTION.mapScale / rate}ms`,
    '--dur-map-blur': `${MOTION.mapBlur / rate}ms`,
    '--dur-pin-drop': `${MOTION.pinDrop / rate}ms`,
    '--dur-pin-ripple': `${MOTION.pinRipple / rate}ms`,
    '--dur-card-in': `${MOTION.cardIn / rate}ms`,
    '--dur-stack-shift': `${MOTION.stackShift / rate}ms`,
    '--dur-scene': `${MOTION.scene / rate}ms`,
    '--dur-pill': `${MOTION.pill / rate}ms`,
    '--ease-stage-out': EASE.out,
    '--ease-stage-move': EASE.move,
    '--ease-stage-map': EASE.map,
  };
  return vars as CSSProperties;
}
