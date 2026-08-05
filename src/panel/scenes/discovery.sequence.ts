import { MOTION } from '../motion';
import type { Timeline } from '../timeline';
import {
  CHIP_PICKS,
  DATES_PLACEHOLDER,
  DATES_VALUE,
  DESTINATION_CHUNKS,
  DESTINATION_PLACEHOLDER,
} from './discovery.data';

/**
 * Scene 1's beat sheet.
 *
 * Written as a plain `async` function awaiting `tl.wait()` between beats, so
 * it reads top to bottom the way the scene plays. Every await is followed by a
 * liveness check: `Timeline.reset()` bumps a generation token, and a wait from
 * a stale generation never resolves, so a restart drops this continuation
 * instead of leaving two sequences fighting over the same DOM.
 *
 * The root is the panel element, not the scene — the map lives outside the
 * stage (it is full-bleed) but is part of the same beat sheet.
 */

type Root = HTMLElement;

const one = (root: Root, selector: string) =>
  root.querySelector<HTMLElement>(selector);

const all = (root: Root, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector));

const PLACEHOLDERS: Record<string, string> = {
  destination: DESTINATION_PLACEHOLDER,
  dates: DATES_PLACEHOLDER,
};

/* ---- The beats --------------------------------------------------------- */

function focusField(root: Root, field: string, on: boolean) {
  one(root, `[data-field="${field}"]`)?.classList.toggle('is-focused', on);
  one(root, '[data-caret]')?.classList.toggle('is-on', on);
}

function typeChunk(root: Root, field: string, chunk: string) {
  const value = one(root, `[data-value="${field}"]`);
  if (!value) return;
  // The first chunk replaces the placeholder rather than appending to it.
  if (value.hasAttribute('data-empty')) {
    value.removeAttribute('data-empty');
    value.textContent = '';
  }
  value.textContent += chunk;
}

function setValue(root: Root, field: string, text: string) {
  const value = one(root, `[data-value="${field}"]`);
  if (!value) return;
  value.removeAttribute('data-empty');
  value.textContent = text;
}

function pickChip(root: Root, key: string) {
  one(root, `[data-chip="${key}"]`)?.classList.add('is-selected');
}

/* ---- The sequence ------------------------------------------------------ */

export async function playDiscovery(tl: Timeline, root: Root) {
  const token = tl.token;

  // The field takes focus before anything is typed, the way a real one does.
  await tl.wait(240);
  if (!tl.alive(token)) return false;
  focusField(root, 'destination', true);

  await tl.wait(160);
  if (!tl.alive(token)) return false;
  for (const chunk of DESTINATION_CHUNKS) {
    typeChunk(root, 'destination', chunk);
    await tl.wait(MOTION.typeChunk);
    if (!tl.alive(token)) return false;
  }

  // Dates arrive whole — they come from a picker, not from typing.
  await tl.wait(140);
  if (!tl.alive(token)) return false;
  focusField(root, 'destination', false);
  setValue(root, 'dates', DATES_VALUE);

  /*
   * Picks inside one filter group come quickly; crossing to the other group
   * takes a beat longer, because that is a second decision rather than a
   * continuation of the first.
   */
  let previousGroup = '';
  for (const pick of CHIP_PICKS) {
    const group = pick.split(':')[0];
    await tl.wait(previousGroup && group !== previousGroup ? 220 : 160);
    if (!tl.alive(token)) return false;
    pickChip(root, pick);
    previousGroup = group;
  }

  await tl.wait(220);
  if (!tl.alive(token)) return false;
  const submit = one(root, '[data-submit]');
  submit?.classList.add('is-pressed');

  await tl.wait(MOTION.pressDown);
  if (!tl.alive(token)) return false;
  submit?.classList.remove('is-pressed');

  /*
   * The handoff. The form starts dissolving, and the map starts coming forward
   * 180ms later — while the form is still 50% opaque and already blurred. The
   * overlap is what keeps this from reading as two objects swapping places;
   * without it there is a frame where the panel is empty.
   */
  await tl.wait(100);
  if (!tl.alive(token)) return false;
  one(root, '[data-form]')?.classList.add('is-out');

  await tl.wait(180);
  if (!tl.alive(token)) return false;
  one(root, '[data-map]')?.classList.add('is-in');

  await tl.wait(MOTION.mapScale);
  return tl.alive(token);
}

/* ---- Resting frames ---------------------------------------------------- */

/**
 * Everything back to the top of the scene. Called before each play, so a
 * restart never inherits half of the previous run.
 */
export function resetDiscovery(root: Root) {
  focusField(root, 'destination', false);
  for (const [field, placeholder] of Object.entries(PLACEHOLDERS)) {
    const value = one(root, `[data-value="${field}"]`);
    if (!value) continue;
    value.setAttribute('data-empty', '');
    value.textContent = placeholder;
  }
  for (const chip of all(root, '[data-chip]')) chip.classList.remove('is-selected');
  one(root, '[data-submit]')?.classList.remove('is-pressed');
  one(root, '[data-form]')?.classList.remove('is-out');
  one(root, '[data-map]')?.classList.remove('is-in');
}

/**
 * The frame reduced motion gets: the end of the scene, not the start. A static
 * empty search form communicates nothing; the map is the point.
 */
export function renderDiscoveryResting(root: Root) {
  resetDiscovery(root);
  setValue(root, 'destination', DESTINATION_CHUNKS.join(''));
  setValue(root, 'dates', DATES_VALUE);
  for (const pick of CHIP_PICKS) pickChip(root, pick);
  one(root, '[data-form]')?.classList.add('is-out');
  one(root, '[data-map]')?.classList.add('is-in');
}
