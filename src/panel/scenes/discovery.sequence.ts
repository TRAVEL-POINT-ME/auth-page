import { MOTION } from '../motion';
import type { Timeline } from '../timeline';
import {
  CHIP_PICKS,
  DESTINATION_CHUNKS,
  DESTINATION_PLACEHOLDER,
  DESTINATION_VALUE,
  LAST_PIN_BEAT,
  NOTIFICATIONS,
  NOTIF_STEP,
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

/* ---- Gaps between beats ------------------------------------------------ */

/**
 * Between filter chips. Picks inside one group come quickly; crossing to the
 * other group takes a beat longer, because that is a second decision rather
 * than a continuation of the first. Both are unhurried enough that the tap on
 * each chip is legible as a tap — that is the point of the beat, not the pace.
 */
const CHIP_GAP = 320;
const CHIP_GAP_CROSS = 470;

/**
 * From the map starting to come forward to the status pill coming up — early
 * enough that the pill is rising while the map is still arriving, not after it.
 *
 * The map's fade runs on a strong ease-out, so it is already ~80% opaque here
 * while the blur has not finished clearing and the zoom has more than a second
 * of travel left. The pill therefore lifts off a map that is visibly still
 * moving, and the two settle as one arrival rather than as two.
 */
const BEFORE_STATUS = 160;
/**
 * From the pill coming up to the first pin landing. Sized so the pins still
 * land 800ms after the map starts, wherever the pill is placed inside that.
 */
const BEFORE_PINS = 640;
/**
 * From the first pin landing to the pill switching to the result: exactly the
 * last pin's delay plus its drop, so the count arrives on the frame the map
 * finishes filling in and the pill is answering the pins. Derived rather than
 * written down — the pins' beats and durations are free to change.
 */
const BEFORE_RESULT = LAST_PIN_BEAT * MOTION.staggerPin + MOTION.pinDrop;
/**
 * How long the result stands before the pill goes. Sized to be read, not
 * glimpsed: the swap into it eats 260ms of cross-fade at the front, so the
 * number is only fully legible for what is left.
 */
const RESULT_HOLD = 1400;
/** From the pill starting to leave to the first notification arriving. */
const BEFORE_STACK = 180;

/* ---- The beats --------------------------------------------------------- */

function focusField(root: Root, field: string, on: boolean) {
  one(root, `[data-field="${field}"]`)?.classList.toggle('is-focused', on);
  one(root, '[data-caret]')?.classList.toggle('is-on', on);
}

/** Holds the caret solid. A real one stops blinking while it is being typed
    into and only picks the blink back up once the hands stop. */
function setTyping(root: Root, on: boolean) {
  one(root, '[data-caret]')?.classList.toggle('is-typing', on);
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

/** The finger on the chip. `motion.css` scales the label, not the chip. */
function pressChip(root: Root, key: string, on: boolean) {
  one(root, `[data-chip="${key}"]`)?.classList.toggle('is-pressed', on);
}

/** The status pill: up over the map, and switched to its result. */
function showStatus(root: Root, on: boolean) {
  one(root, '[data-search]')?.classList.toggle('is-in', on);
}

function resolveStatus(root: Root) {
  one(root, '[data-search]')?.classList.add('is-found');
}

/*
 * One class for all six pins. The stagger is an `animation-delay` derived from
 * each pin's `--pin-beat`, so there is nothing per-pin on the timeline and
 * nothing to keep in sync between here and the CSS.
 */
function dropPins(root: Root) {
  one(root, '[data-pins]')?.classList.add('is-in');
}

/** The same pins, already landed — no keyframes involved. See `motion.css`. */
function restPins(root: Root) {
  one(root, '[data-pins]')?.classList.add('is-rest');
}

/**
 * Where every card that has arrived so far belongs. The newest sits at the top
 * of the stack and everything already there has been pushed down one step.
 *
 * Written straight onto the slot's own `transform` rather than through a custom
 * property on the stack: a variable on the parent invalidates style for every
 * descendant, and this runs while three cards are mid-transition.
 */
function restack(root: Root, arrived: number) {
  NOTIFICATIONS.forEach((notification, index) => {
    if (index >= arrived) return;
    const slot = one(root, `[data-slot="${notification.id}"]`);
    if (!slot) return;
    slot.style.transform = `translateY(${(arrived - 1 - index) * NOTIF_STEP}px)`;
  });
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
  setTyping(root, true);
  for (const { text, hold } of DESTINATION_CHUNKS) {
    typeChunk(root, 'destination', text);
    await tl.wait(hold);
    if (!tl.alive(token)) return false;
  }
  setTyping(root, false);

  await tl.wait(220);
  if (!tl.alive(token)) return false;
  focusField(root, 'destination', false);

  /*
   * Each chip is a tap, not a state change: down under the finger, then back up
   * through the overshoot in `motion.css`. The selection commits on the way
   * down, so the fill and the press are the same event.
   */
  let previousGroup = '';
  for (const pick of CHIP_PICKS) {
    const group = pick.split(':')[0];
    await tl.wait(previousGroup && group !== previousGroup ? CHIP_GAP_CROSS : CHIP_GAP);
    if (!tl.alive(token)) return false;
    pressChip(root, pick, true);
    pickChip(root, pick);

    await tl.wait(MOTION.chipDown);
    if (!tl.alive(token)) return false;
    pressChip(root, pick, false);
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

  /*
   * The pill comes up before the pins, not with them: it is the thing that
   * explains what the pins are, and it has to be legible by the time the first
   * one lands.
   */
  await tl.wait(BEFORE_STATUS);
  if (!tl.alive(token)) return false;
  showStatus(root, true);

  /*
   * The pins wait out the map's fade and blur (500 and 600ms) and land into the
   * tail of its scale, which is still easing to rest until 1100ms. Landing on a
   * map that is still settling is what ties them to it; landing on one that has
   * already stopped would read as a second, unrelated animation.
   */
  await tl.wait(BEFORE_PINS);
  if (!tl.alive(token)) return false;
  dropPins(root);

  // The last pin lands, and the pill stops searching.
  await tl.wait(BEFORE_RESULT);
  if (!tl.alive(token)) return false;
  resolveStatus(root);

  await tl.wait(RESULT_HOLD);
  if (!tl.alive(token)) return false;
  showStatus(root, false);

  /*
   * The stack starts as the pill is going down, on the same centre — so the
   * panel never has two things arriving at once, and what replaces the pill is
   * unmistakably what the pill was counting.
   */
  await tl.wait(BEFORE_STACK);
  if (!tl.alive(token)) return false;
  for (const [index, notification] of NOTIFICATIONS.entries()) {
    /*
     * The gap opens first, the card drops into it. The first card has nothing
     * to displace, so it lands without the lead.
     */
    restack(root, index + 1);
    if (index > 0) {
      await tl.wait(MOTION.stackLead);
      if (!tl.alive(token)) return false;
    }
    one(root, `[data-card="${notification.id}"]`)?.classList.add('is-in');
    if (index === NOTIFICATIONS.length - 1) break;
    await tl.wait(MOTION.staggerCard - MOTION.stackLead);
    if (!tl.alive(token)) return false;
  }

  await tl.wait(MOTION.stackShift);
  return tl.alive(token);
}

/* ---- Resting frames ---------------------------------------------------- */

/**
 * Everything back to the top of the scene. Called before each play, so a
 * restart never inherits half of the previous run.
 */
export function resetDiscovery(root: Root) {
  focusField(root, 'destination', false);
  setTyping(root, false);
  /* Only the destination winds back — the dates are filled in the markup and
     are never a beat. */
  const destination = one(root, '[data-value="destination"]');
  if (destination) {
    destination.setAttribute('data-empty', '');
    destination.textContent = DESTINATION_PLACEHOLDER;
  }
  for (const chip of all(root, '[data-chip]')) {
    chip.classList.remove('is-selected', 'is-pressed');
  }
  one(root, '[data-submit]')?.classList.remove('is-pressed');
  one(root, '[data-form]')?.classList.remove('is-out');
  one(root, '[data-search]')?.classList.remove('is-in', 'is-found');
  one(root, '[data-map]')?.classList.remove('is-in');
  one(root, '[data-pins]')?.classList.remove('is-in', 'is-rest');
  for (const card of all(root, '[data-card]')) card.classList.remove('is-in');
  /*
   * Cleared rather than set to a transform: the slots keep their transition, so
   * a restart mid-stack eases them back to the top from wherever they are
   * instead of teleporting.
   */
  for (const slot of all(root, '[data-slot]')) slot.style.transform = '';
}

/**
 * The frame reduced motion gets: the end of the scene, not the start. A static
 * empty search form communicates nothing; the map is the point.
 */
export function renderDiscoveryResting(root: Root) {
  resetDiscovery(root);
  setValue(root, 'destination', DESTINATION_VALUE);
  for (const pick of CHIP_PICKS) pickChip(root, pick);
  one(root, '[data-form]')?.classList.add('is-out');
  one(root, '[data-map]')?.classList.add('is-in');
  restPins(root);
  for (const notification of NOTIFICATIONS) {
    one(root, `[data-card="${notification.id}"]`)?.classList.add('is-in');
  }
  restack(root, NOTIFICATIONS.length);
}
