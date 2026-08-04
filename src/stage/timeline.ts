/**
 * The demo's scheduler.
 *
 * Scene code is written as plain `async` functions that `await timeline.wait()`
 * between beats, which reads the way a beat sheet does. What the timeline adds
 * over a bare `setTimeout` is the three things a chained one cannot do:
 *
 *   - **pause**: time stops advancing, and a resumed wait picks up the
 *     remainder it had left rather than starting over;
 *   - **rate**: a single multiplier slows (or speeds) every wait at once;
 *   - **cancellation**: every restart bumps a generation token, and a wait
 *     that captured an older one never resolves — so the async function that
 *     was mid-sequence simply stops, with no orphaned timers behind it.
 */

type Pending = {
  /** How much of the wait is still owed, in wall-clock ms. */
  remaining: number;
  /** When the current timer was armed, so a pause can measure what it ate. */
  armedAt: number;
  timer: ReturnType<typeof setTimeout>;
  settle: () => void;
};

export type Easing = (t: number) => number;

/** `ease-out` as a number function, for values that count rather than move. */
export const easeOutValue: Easing = (t) => 1 - Math.pow(1 - t, 3);

export class Timeline {
  /** Incremented on every restart. Scene functions capture it and bail out. */
  private generation = 0;
  private paused = false;
  private rate = 1;
  private pending = new Set<Pending>();
  private frames = new Set<number>();

  /** The token a scene function captures on entry. */
  get token() {
    return this.generation;
  }

  /** Whether the sequence that captured `token` is still the current one. */
  alive(token: number) {
    return token === this.generation;
  }

  get isPaused() {
    return this.paused;
  }

  get speed() {
    return this.rate;
  }

  /**
   * An awaitable delay. Resolves only if the generation it captured is still
   * current; otherwise it stays pending forever and its continuation — the
   * rest of that scene function — is dropped.
   */
  wait(ms: number) {
    const token = this.generation;
    return new Promise<void>((resolve) => {
      const entry = {
        remaining: ms / this.rate,
        armedAt: 0,
        timer: 0 as unknown as ReturnType<typeof setTimeout>,
        settle: () => {
          this.pending.delete(entry);
          if (token === this.generation) resolve();
        },
      } satisfies Pending;

      this.pending.add(entry);
      if (!this.paused) this.arm(entry);
    });
  }

  /**
   * An awaitable tween driven by `requestAnimationFrame`, for the values that
   * count up rather than move. Same pause / rate / generation rules as `wait`.
   *
   * It is raced against a plain `wait` of the same length. Frames stop
   * altogether under conditions the page does not control — a backgrounded
   * tab, an occluded window — and a tween that cannot finish would hold up
   * every scene queued behind it. The timer is what keeps the sequence moving;
   * the worst it can do is land the value rather than count it up to it.
   */
  async tween(ms: number, ease: Easing, onUpdate: (progress: number) => void) {
    await Promise.race([this.frameLoop(ms, ease, onUpdate), this.wait(ms)]);
    onUpdate(ease(1));
  }

  private frameLoop(
    ms: number,
    ease: Easing,
    onUpdate: (progress: number) => void,
  ) {
    const token = this.generation;
    const duration = ms / this.rate;

    return new Promise<void>((resolve) => {
      let elapsed = 0;
      let last = performance.now();
      let frame = 0;

      const step = (now: number) => {
        this.frames.delete(frame);
        if (token !== this.generation) return;

        // A paused frame contributes no elapsed time, so the tween holds at
        // whatever value it had reached. The delta is capped because frames
        // stop entirely in a background tab, and the first one back would
        // otherwise carry the whole gap and snap the value to its end.
        if (!this.paused) elapsed += Math.min(now - last, 100);
        last = now;

        const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
        onUpdate(ease(progress));

        if (progress < 1) {
          frame = requestAnimationFrame(step);
          this.frames.add(frame);
          return;
        }
        resolve();
      };

      frame = requestAnimationFrame(step);
      this.frames.add(frame);
    });
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    const now = performance.now();
    for (const entry of this.pending) {
      clearTimeout(entry.timer);
      entry.remaining = Math.max(0, entry.remaining - (now - entry.armedAt));
    }
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    for (const entry of this.pending) this.arm(entry);
  }

  /**
   * The rate applies to waits armed from here on. In-flight waits keep the
   * duration they were armed with — a beat already half-played does not
   * suddenly change length under the viewer.
   */
  setRate(rate: number) {
    this.rate = rate;
  }

  /** Cancels everything in flight and hands out a fresh token. */
  reset() {
    this.generation += 1;
    for (const entry of this.pending) clearTimeout(entry.timer);
    this.pending.clear();
    for (const frame of this.frames) cancelAnimationFrame(frame);
    this.frames.clear();
    this.paused = false;
  }

  private arm(entry: Pending) {
    entry.armedAt = performance.now();
    entry.timer = setTimeout(entry.settle, entry.remaining);
  }
}
