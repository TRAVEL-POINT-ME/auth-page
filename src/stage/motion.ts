import type { CSSProperties } from 'react';

/**
 * The demo's motion tokens — one declaration, used by both sides.
 *
 * The timeline schedules its beats in JS while the elements themselves are
 * transitioned by CSS, so the two have to agree on every duration. Rather than
 * writing each number twice, the durations below are written onto the stage
 * element as custom properties (see `motionVars`) and the stylesheet reads
 * them from there. Scene code never spells out a duration of its own.
 */

export const MOTION = {
  /** Scene enter / exit cross-fade. The two overlap. */
  scene: 420,
  /** A `data-reveal` element appearing. */
  reveal: 340,
  /** Field focus change, chip selection, button press. */
  micro: 180,
  /** A quote dot arriving on the axis. */
  land: 460,
  /** The scene 2 -> 3 convergence. */
  converge: 620,
  /** Between consecutive `data-reveal` indices. */
  staggerReveal: 180,
  /** Between consecutive quote dots landing. */
  staggerDot: 55,
  /** One chunk of simulated typing. */
  typeChunk: 260,
  /** The typing indicator giving way to the reply it stands in for. */
  chatSwap: 240,
} as const;

export const EASE = {
  out: 'cubic-bezier(0, 0, .2, 1)',
  land: 'cubic-bezier(.2, .7, .3, 1)',
  converge: 'cubic-bezier(.4, 0, .2, 1)',
} as const;

/**
 * The custom properties the stage element carries. The rate divides every
 * duration, so the review mode's 0.5x stretches the CSS transitions by exactly
 * the factor the timeline stretches its own waits by.
 */
export function motionVars(rate: number): CSSProperties {
  const vars = {
    '--dur-scene': `${MOTION.scene / rate}ms`,
    '--dur-reveal': `${MOTION.reveal / rate}ms`,
    '--dur-micro': `${MOTION.micro / rate}ms`,
    '--dur-land': `${MOTION.land / rate}ms`,
    '--dur-converge': `${MOTION.converge / rate}ms`,
    '--dur-chat-swap': `${MOTION.chatSwap / rate}ms`,
    '--ease-out': EASE.out,
    '--ease-land': EASE.land,
    '--ease-converge': EASE.converge,
  };
  return vars as CSSProperties;
}
