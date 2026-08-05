import { MOTION } from '../motion';
import type { Timeline } from '../timeline';

type Root = HTMLElement;

const OPENING_PAUSE = MOTION.expertMessageIn;
const CONFIRMATION_TYPING = 1200;
const CONFIRMATION_HOLD = 720;
const REQUEST_HOLD = 650;
const RESPONSE_TYPING = 900;
const RESPONSE_HOLD = 620;
const RESOLUTION_TYPING = 1400;
const RESOLUTION_HOLD = 720;

const scene = (root: Root) => root.querySelector<HTMLElement>('[data-expert-scene]');

const one = (root: Root, selector: string) =>
  scene(root)?.querySelector<HTMLElement>(selector);

const all = (root: Root, selector: string) =>
  Array.from(scene(root)?.querySelectorAll<HTMLElement>(selector) ?? []);

function showSlot(root: Root, id: string) {
  one(root, `[data-expert-slot="${id}"]`)?.classList.add('is-in');
}

function showTyping(root: Root, id: string) {
  showSlot(root, id);
  one(root, `[data-expert-typing="${id}"]`)?.classList.add('is-in');
}

function showMessage(root: Root, id: string) {
  one(root, `[data-expert-typing="${id}"]`)?.classList.remove('is-in');
  one(root, `[data-expert-message="${id}"]`)?.classList.add('is-in');
}

/**
 * A short, linear conversation rather than a decorative stagger: a message is
 * read, the next participant responds, and the support agent visibly types
 * before each of her replies. Every wait is cancellable by Timeline.reset().
 */
export async function playExpert(tl: Timeline, root: Root) {
  const token = tl.token;

  await tl.wait(OPENING_PAUSE);
  if (!tl.alive(token)) return false;
  showTyping(root, 'confirmation');

  await tl.wait(CONFIRMATION_TYPING);
  if (!tl.alive(token)) return false;
  showMessage(root, 'confirmation');

  await tl.wait(CONFIRMATION_HOLD);
  if (!tl.alive(token)) return false;
  showSlot(root, 'request');

  await tl.wait(REQUEST_HOLD);
  if (!tl.alive(token)) return false;
  showTyping(root, 'response');

  await tl.wait(RESPONSE_TYPING);
  if (!tl.alive(token)) return false;
  showMessage(root, 'response');

  await tl.wait(RESPONSE_HOLD);
  if (!tl.alive(token)) return false;
  showTyping(root, 'resolution');

  await tl.wait(RESOLUTION_TYPING);
  if (!tl.alive(token)) return false;
  showMessage(root, 'resolution');

  await tl.wait(RESOLUTION_HOLD);
  if (!tl.alive(token)) return false;
  showSlot(root, 'thanks');

  await tl.wait(MOTION.expertMessageIn);
  return tl.alive(token);
}

export function resetExpert(root: Root) {
  for (const element of all(root, '[data-expert-slot]')) {
    element.classList.remove('is-in');
  }
  for (const element of all(root, '[data-expert-message]')) {
    element.classList.remove('is-in');
  }
  for (const element of all(root, '[data-expert-typing]')) {
    element.classList.remove('is-in');
  }
}

/** Reduced motion gets the complete conversation and no typing loop. */
export function renderExpertResting(root: Root) {
  resetExpert(root);
  for (const element of all(root, '[data-expert-slot], [data-expert-message]')) {
    element.classList.add('is-in');
  }
}
