/**
 * The beat sheets.
 *
 * Each scene is one `async` function that shows its scene, plays its beats and
 * returns after its hold. Timings below are cumulative offsets from the moment
 * that scene's own enter transition starts, so they can be read straight off
 * the specification.
 *
 * Nothing here reaches for a duration of its own: every number is either a
 * motion token or a beat offset expressed as a difference between two of them.
 */

import {
  arrivalOrder,
  BAND_CENTRE_Y,
  DEMO,
  liveRates,
  quoteBandY,
  quoteOffsetPct,
} from './demo';
import { MOTION } from './motion';
import { easeOutValue, Timeline } from './timeline';

/** Every class the timeline is allowed to add, so `resetAll` can strip them. */
const STATE_CLASSES = [
  'is-active',
  'is-in',
  'is-on',
  'is-out',
  'is-focused',
  'is-pressed',
  'is-selected',
  'is-dimmed',
  'is-best',
  'is-converging',
];

type Root = HTMLElement;

function all<T extends HTMLElement>(root: ParentNode, selector: string) {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends HTMLElement>(root: ParentNode, selector: string) {
  return root.querySelector<T>(selector);
}

function sceneEl(root: Root, index: number) {
  return one(root, `[data-scene="${index}"]`);
}

// ---- Reset -----------------------------------------------------------------

/**
 * Returns every animated element to its initial state. Runs at the start of a
 * pass, never mid-scene — a scene that is halfway through is cancelled by the
 * generation token, not by this.
 */
export function resetAll(root: Root) {
  for (const el of all(root, `.${STATE_CLASSES.join(', .')}`)) {
    el.classList.remove(...STATE_CLASSES);
  }

  // Fields go back to their placeholder text and its muted colour.
  for (const value of all(root, '[data-field-value]')) {
    value.textContent = value.dataset.placeholder ?? '';
    value.setAttribute('data-empty', '');
  }

  // Counters go back to zero, and the dots scene 2 generated are thrown away.
  for (const counter of all(root, '[data-counter]')) counter.textContent = '0';
  for (const dot of all(root, '[data-quote]')) dot.remove();

  // Anything the convergence wrote inline.
  for (const el of all(root, '[style*="transform"], [style*="opacity"]')) {
    el.style.removeProperty('transform');
    el.style.removeProperty('opacity');
  }

  // The best-rate label is placed over whichever dot wins, which is a
  // measurement, so it is taken again on the next pass rather than kept.
  one(root, '[data-best-label]')?.style.removeProperty('left');
}

// ---- Shared helpers --------------------------------------------------------

function showScene(root: Root, index: number, onScene?: (n: number) => void) {
  for (const scene of all(root, '[data-scene]')) {
    scene.classList.toggle('is-active', scene.dataset.scene === String(index));
  }
  onScene?.(index);
}

/**
 * Walks a scene's `data-reveal` indices in order, revealing everything that
 * shares an index together. Returns the offset of the last reveal, so the
 * caller can work out how much hold is left.
 */
async function runReveals(tl: Timeline, scene: HTMLElement, startAt: number) {
  const groups = new Map<number, { elements: HTMLElement[]; hold: number }>();

  for (const el of all(scene, '[data-reveal]')) {
    const index = Number(el.dataset.reveal);
    const hold = Number(el.dataset.revealHold ?? 0);
    const group = groups.get(index) ?? { elements: [], hold: 0 };
    group.elements.push(el);
    group.hold = Math.max(group.hold, hold);
    groups.set(index, group);
  }

  const ordered = [...groups.entries()].sort(([a], [b]) => a - b);
  let offset = startAt;

  await tl.wait(startAt);

  for (const [index, group] of ordered) {
    for (const el of group.elements) el.classList.add('is-in');

    const isLast = index === ordered[ordered.length - 1][0];
    if (isLast) break;

    const gap = MOTION.staggerReveal + group.hold;
    offset += gap;
    await tl.wait(gap);
  }

  return offset;
}

async function countUp(
  tl: Timeline,
  el: HTMLElement,
  target: number,
  duration: number,
) {
  await tl.tween(duration, easeOutValue, (progress) => {
    el.textContent = String(Math.round(target * progress));
  });
  el.textContent = String(target);
}

// ---- Scene 1 — search form -------------------------------------------------

/**
 * The claim of this scene is how little work the search takes, so the form
 * fills itself calmly. Typing is chunked rather than per character: a terminal
 * types one letter at a time, an autocomplete resolves in jumps, and what is
 * being shown here is the second one.
 */
async function scene1(tl: Timeline, root: Root, onScene?: (n: number) => void) {
  const token = tl.token;
  const scene = sceneEl(root, 1);
  showScene(root, 1, onScene);
  if (!scene) return;

  const fields = all(scene, '[data-field]');
  const caret = one(scene, '[data-caret]');
  const submit = one(scene, '[data-submit]');

  // 500 — field 1 takes focus, the caret appears and starts blinking.
  await tl.wait(500);
  fields[0]?.classList.add('is-focused');
  caret?.classList.add('is-on');

  // 850 — typing begins, and runs to 1890 across four chunks.
  await tl.wait(350);
  const destination = fields[0] && one(fields[0], '[data-field-value]');
  for (const chunk of DEMO.destinationChunks) {
    if (destination) {
      destination.textContent = chunk;
      destination.removeAttribute('data-empty');
    }
    await tl.wait(MOTION.typeChunk);
  }

  // 2290 — the caret hides and focus moves on.
  await tl.wait(2290 - 1890);
  caret?.classList.remove('is-on');
  fields[0]?.classList.remove('is-focused');
  fields[1]?.classList.add('is-focused');

  // 2590 — a date picker returns a whole value, so it is not typed.
  await tl.wait(300);
  const dates = fields[1] && one(fields[1], '[data-field-value]');
  if (dates) {
    dates.textContent = DEMO.dateRange;
    dates.removeAttribute('data-empty');
  }

  // 3040 — field 2 lets go, and the first filter group makes its choice.
  await tl.wait(450);
  fields[1]?.classList.remove('is-focused');

  // Chips are grouped by the control they sit in, and a group with more than
  // one selection ticks them off in DOM order.
  const groups = new Map<Element, HTMLElement[]>();
  for (const chip of all(scene, '[data-chip-select]')) {
    const parent = chip.parentElement;
    if (!parent) continue;
    groups.set(parent, [...(groups.get(parent) ?? []), chip]);
  }

  const [firstGroup, secondGroup] = [...groups.values()];
  let elapsed = 3040;

  for (const [index, chip] of (firstGroup ?? []).entries()) {
    if (index > 0) {
      await tl.wait(MOTION.micro);
      elapsed += MOTION.micro;
    }
    chip.classList.add('is-selected');
  }

  // 3320 — the second group.
  await tl.wait(3320 - elapsed);
  for (const [index, chip] of (secondGroup ?? []).entries()) {
    if (index > 0) await tl.wait(MOTION.micro);
    chip.classList.add('is-selected');
  }

  // 3920 — the submit control presses and releases. A scale, nothing else:
  // no ripple, no glow, no colour change.
  await tl.wait(3920 - 3320);
  submit?.classList.add('is-pressed');
  await tl.wait(MOTION.micro);
  submit?.classList.remove('is-pressed');

  // 4600 — hold ends.
  await tl.wait(4600 - 4100);
  return tl.alive(token);
}

// ---- Scene 2 — backstage rate comparison -----------------------------------

/**
 * The one scene that is not a screen anybody operates. Counters run up, 28
 * quotes land out of order, the cheapest one is picked out, and then every
 * quote collapses onto it — which is the argument of the whole demo in a
 * single beat: many prices become one number.
 */
async function scene2(tl: Timeline, root: Root, onScene?: (n: number) => void) {
  const token = tl.token;
  const scene = sceneEl(root, 2);
  showScene(root, 2, onScene);
  if (!scene) return;

  const track = one(scene, '[data-spread-track]');
  const template = track && one(track, '[data-quote-template]');
  const counters = all(scene, '[data-counter]');
  const connector = one(scene, '[data-counter-link]');
  const bestLabel = one(scene, '[data-best-label]');

  // The dots are built up front but not revealed — every one of them is in the
  // DOM, at its final position, before the first is allowed to be seen.
  const dots: HTMLElement[] = [];
  if (track && template) {
    for (let index = 0; index < liveRates; index += 1) {
      const dot = template.cloneNode(true) as HTMLElement;
      dot.removeAttribute('data-quote-template');
      dot.removeAttribute('hidden');
      dot.setAttribute('data-quote', String(index));
      dot.style.left = `${quoteOffsetPct(index)}%`;
      dot.style.top = `${quoteBandY(index)}px`;
      track.append(dot);
      dots.push(dot);
    }
  }

  // 200 -> 1400 — sources checked.
  await tl.wait(200);
  if (counters[0]) {
    await countUp(tl, counters[0], DEMO.sourcesChecked, 1200);
  }

  // 1400 — the connector between the two counters.
  connector?.classList.add('is-in');

  // 1600 -> 2400 — live rates.
  await tl.wait(200);
  if (counters[1]) await countUp(tl, counters[1], liveRates, 800);

  // 2400 — the quotes start coming back, scrambled rather than in price order.
  for (const [step, index] of arrivalOrder.entries()) {
    dots[index]?.classList.add('is-in');
    if (step < arrivalOrder.length - 1) await tl.wait(MOTION.staggerDot);
  }

  // 4290 — everything but the cheapest recedes.
  const landed = 2400 + (arrivalOrder.length - 1) * MOTION.staggerDot;
  await tl.wait(4290 - landed);
  for (const [index, dot] of dots.entries()) {
    dot.classList.add(index === 0 ? 'is-best' : 'is-dimmed');
  }

  // 4570 — the label, centred on the winning dot.
  await tl.wait(280);
  if (bestLabel) {
    bestLabel.style.left = `calc(${quoteOffsetPct(0)}% - ${
      bestLabel.offsetWidth / 2
    }px)`;
    bestLabel.classList.add('is-in');
  }

  // 6320 — the convergence. Layout is read once, here, and never again; from
  // this point on every dot moves on `transform` alone.
  await tl.wait(6320 - 4570);
  if (track && dots.length) {
    const width = track.getBoundingClientRect().width;
    const targetX = (quoteOffsetPct(0) / 100) * width;

    track.classList.add('is-converging');

    for (const [index, dot] of dots.entries()) {
      const dx = targetX - (quoteOffsetPct(index) / 100) * width;
      const dy = BAND_CENTRE_Y - quoteBandY(index);
      dot.style.transform = `translate(${dx}px, ${dy}px) scale(.5)`;
      if (index !== 0) dot.style.opacity = '0';
    }
  }

  // 6940 — the convergence lands, and scene 3 is already fading up over it.
  await tl.wait(MOTION.converge);
  return tl.alive(token);
}

// ---- Scene 3 — best available net rate -------------------------------------

/**
 * The card the user will really see after signing in, so it arrives finished.
 * Only the price line is revealed, and it is the number the convergence just
 * landed on.
 */
async function scene3(
  tl: Timeline,
  root: Root,
  footnote: HTMLElement | null,
  onScene?: (n: number) => void,
) {
  const token = tl.token;
  const scene = sceneEl(root, 3);
  showScene(root, 3, onScene);
  if (!scene) return;

  // The reveals run alongside the main line rather than in front of it — a
  // stale generation stops them the same way it stops everything else.
  void runReveals(tl, scene, 380);

  // 980 — the annotation outside the card.
  await tl.wait(980);
  footnote?.classList.add('is-in');

  // 3380 — hold ends.
  await tl.wait(3380 - 980);
  return tl.alive(token);
}

// ---- Scene 4 — markup and margin -------------------------------------------

/** Five reveals and no counting: this calculation is settled, not in progress. */
async function scene4(tl: Timeline, root: Root, onScene?: (n: number) => void) {
  const token = tl.token;
  const scene = sceneEl(root, 4);
  showScene(root, 4, onScene);
  if (!scene) return;

  const last = await runReveals(tl, scene, 300);
  await tl.wait(4180 - last);
  return tl.alive(token);
}

// ---- Scene 5 — support conversation ----------------------------------------

/**
 * A real exchange has an uneven rhythm. The gaps below — 900 / 1300 / 400 /
 * 1400 / 1200 / 3000 — are deliberately irregular; an even stagger would make
 * the thread look like a list rendering itself.
 */
async function scene5(tl: Timeline, root: Root, onScene?: (n: number) => void) {
  const token = tl.token;
  const scene = sceneEl(root, 5);
  showScene(root, 5, onScene);
  if (!scene) return;

  const message = (n: number) => one(scene, `[data-chat-message="${n}"]`);
  const typing = one(scene, '[data-chat-typing]');
  const check = one(scene, '[data-chat-check]');

  // 400 — the agent's question goes out.
  await tl.wait(400);
  message(1)?.classList.add('is-in');

  // 1300 — someone on the other end starts writing.
  await tl.wait(900);
  typing?.classList.add('is-in');

  // 2600 — the indicator gives way to the reply, in place.
  await tl.wait(1300);
  typing?.classList.remove('is-in');
  typing?.classList.add('is-out');
  message(2)?.classList.add('is-in');

  // 3000 — who said it, and when.
  await tl.wait(400);
  message(3)?.classList.add('is-in');

  // 4400 — the confirmation, with its check a beat behind the card.
  await tl.wait(1400);
  message(4)?.classList.add('is-in');
  await tl.wait(120);
  check?.classList.add('is-in');

  // 5600 — the last word.
  await tl.wait(5600 - 4520);
  message(5)?.classList.add('is-in');

  // 8600 — the pass ends here, on the scene the product wants remembered.
  await tl.wait(3000);
  return tl.alive(token);
}

// ---- The pass --------------------------------------------------------------

/**
 * One full pass, then stop. Five scenes is about 29 seconds, which is already
 * a long time to hold a loop next to a sign-in form — and the form is the only
 * thing on this page anybody actually has to do.
 */
export async function playDemo(
  tl: Timeline,
  root: Root,
  footnote: HTMLElement | null,
  onScene?: (n: number) => void,
) {
  const token = tl.token;
  resetAll(root);
  footnote?.classList.remove('is-in');

  if (!(await scene1(tl, root, onScene))) return;
  if (!(await scene2(tl, root, onScene))) return;
  if (!(await scene3(tl, root, footnote, onScene))) return;
  if (!(await scene4(tl, root, onScene))) return;
  await scene5(tl, root, onScene);

  return tl.alive(token);
}

// ---- Reduced motion --------------------------------------------------------

/**
 * With `prefers-reduced-motion: reduce` the sequence does not play at all. The
 * stage renders the frame it would have finished on — not scene 1, which is
 * setup, and a static search form communicates nothing.
 */
export function renderRestingFrame(root: Root, footnote: HTMLElement | null) {
  resetAll(root);

  for (const field of all(root, '[data-field]')) {
    const value = one(field, '[data-field-value]');
    if (!value) continue;
    if (field.dataset.field === '1') value.textContent = DEMO.destination;
    if (field.dataset.field === '2') value.textContent = DEMO.dateRange;
    value.removeAttribute('data-empty');
  }

  for (const chip of all(root, '[data-chip-select]')) {
    chip.classList.add('is-selected');
  }

  const counters = all(root, '[data-counter]');
  if (counters[0]) counters[0].textContent = String(DEMO.sourcesChecked);
  if (counters[1]) counters[1].textContent = String(liveRates);

  const track = one(root, '[data-spread-track]');
  const template = track && one(track, '[data-quote-template]');
  if (track && template) {
    for (let index = 0; index < liveRates; index += 1) {
      const dot = template.cloneNode(true) as HTMLElement;
      dot.removeAttribute('data-quote-template');
      dot.removeAttribute('hidden');
      dot.setAttribute('data-quote', String(index));
      dot.style.left = `${quoteOffsetPct(index)}%`;
      dot.style.top = `${quoteBandY(index)}px`;
      dot.classList.add('is-in', index === 0 ? 'is-best' : 'is-dimmed');
      track.append(dot);
    }
  }

  const bestLabel = one(root, '[data-best-label]');
  if (bestLabel) {
    bestLabel.style.left = `calc(${quoteOffsetPct(0)}% - ${
      bestLabel.offsetWidth / 2
    }px)`;
  }

  const settled = '[data-reveal], [data-fade], [data-chat-message], [data-chat-check]';
  for (const el of all(root, settled)) el.classList.add('is-in');

  footnote?.classList.add('is-in');
  showScene(root, 5);
}
