import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { playDemo, renderRestingFrame } from './sequence';
import { Timeline } from './timeline';

export type DemoControls = {
  /** Which scene is showing, for the development indicator. */
  scene: number;
  paused: boolean;
  rate: number;
  /** True once the demo has stopped for good — a full pass, or a focused field. */
  finished: boolean;
  toggle: () => void;
  restart: () => void;
  setRate: (rate: number) => void;
};

const SCENE_COUNT = 5;

/**
 * Runs the demo against the stage's DOM and applies the loop policy.
 *
 * The sequence plays exactly one pass and then stops, on the scene the product
 * most wants remembered. It pauses whenever nobody can be watching — the tab is
 * hidden, or the stage has scrolled out of the viewport — and it stops outright
 * the moment someone starts filling in the sign-in form, because at that point
 * the form is the only thing on the page that matters.
 */
export function useDemo(
  stageRef: RefObject<HTMLElement | null>,
  footnoteRef: RefObject<HTMLElement | null>,
): DemoControls {
  const timelineRef = useRef<Timeline | null>(null);
  if (!timelineRef.current) timelineRef.current = new Timeline();
  const timeline = timelineRef.current;

  const [scene, setScene] = useState(1);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState(1);
  const [finished, setFinished] = useState(false);

  /*
   * Focusing a sign-in field is a stop, not a pause: the demo must not start
   * moving again next to somebody who is typing. Kept in a ref so the
   * observers below read the current value without being re-subscribed.
   */
  const stopped = useRef(false);

  const start = useCallback(() => {
    const root = stageRef.current;
    if (!root) return;

    // `reset` hands out a fresh generation token but leaves the rate alone, so
    // a restart in review mode stays in review mode.
    timeline.reset();
    stopped.current = false;
    setPaused(false);
    setFinished(false);

    void playDemo(timeline, root, footnoteRef.current, setScene).then(
      (completed) => {
        if (completed) setFinished(true);
      },
    );
  }, [footnoteRef, stageRef, timeline]);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;

    // Reduced motion renders the finished frame and never animates.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderRestingFrame(root, footnoteRef.current);
      setScene(SCENE_COUNT);
      setFinished(true);
      return;
    }

    start();

    const hold = () => {
      timeline.pause();
      setPaused(true);
    };

    const release = () => {
      if (stopped.current) return;
      timeline.resume();
      setPaused(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.intersectionRatio < 0.4 ? hold() : release()),
      { threshold: [0, 0.4, 1] },
    );
    observer.observe(root);

    const onVisibility = () =>
      document.visibilityState === 'hidden' ? hold() : release();
    document.addEventListener('visibilitychange', onVisibility);
    // A page that loads in a background tab never fires the event, so the
    // current state has to be read rather than waited for.
    onVisibility();

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest('[data-auth-column]')) return;
      if (!target.matches('input, textarea, select')) return;
      stopped.current = true;
      hold();
    };
    document.addEventListener('focusin', onFocusIn);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', onFocusIn);
      timeline.reset();
    };
  }, [footnoteRef, stageRef, start, timeline]);

  const toggle = useCallback(() => {
    if (timeline.isPaused) {
      stopped.current = false;
      timeline.resume();
      setPaused(false);
      return;
    }
    timeline.pause();
    setPaused(true);
  }, [timeline]);

  const setRate = useCallback(
    (next: number) => {
      timeline.setRate(next);
      setRateState(next);
    },
    [timeline],
  );

  return { scene, paused, rate, finished, toggle, restart: start, setRate };
}

