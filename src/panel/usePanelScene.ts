import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  playDiscovery,
  renderDiscoveryResting,
  resetDiscovery,
} from './scenes/discovery.sequence';
import {
  playExpert,
  renderExpertResting,
  resetExpert,
} from './scenes/expert.sequence';
import type { SceneId } from './SceneSwitcher';
import { Timeline } from './timeline';

export type PanelControls = {
  paused: boolean;
  rate: number;
  finished: boolean;
  scene: SceneId;
  toggle: () => void;
  restart: () => void;
  setRate: (rate: number) => void;
  selectScene: (id: SceneId) => void;
};

/**
 * Plays the panel's scene once and then leaves it at rest.
 *
 * Three gates can hold the sequence, and only the third is permanent:
 *
 *   - the panel is less than 40% on screen;
 *   - the tab is hidden;
 *   - a sign-in field has taken focus — a **stop**, not a pause. Once someone
 *     is actually signing in, motion beside the form is a distraction, and it
 *     should not resume the moment they tab away from the input.
 */
export function usePanelScene(rootRef: RefObject<HTMLDivElement | null>): PanelControls {
  const timeline = useMemo(() => new Timeline(), []);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState(1);
  const [finished, setFinished] = useState(false);
  const [scene, setScene] = useState<SceneId>(1);

  const stopped = useRef(false);
  const onScreen = useRef(true);
  const reduced = useRef(false);
  /* Which scene a restart should replay — read inside callbacks that must not
     be re-created every time the scene changes. */
  const current = useRef<SceneId>(1);

  const hold = useCallback(() => {
    timeline.pause();
    setPaused(true);
  }, [timeline]);

  const release = useCallback(() => {
    if (stopped.current) return;
    if (!onScreen.current) return;
    if (document.visibilityState === 'hidden') return;
    timeline.resume();
    setPaused(false);
  }, [timeline]);

  /** Plays either scene from the top after winding both back to a clean frame. */
  const play = useCallback(
    (id: SceneId) => {
      const root = rootRef.current;
      if (!root) return;
      current.current = id;
      timeline.reset();
      setPaused(false);
      resetDiscovery(root);
      resetExpert(root);
      // Reduced motion gets the finished frame in one go, on a hand-picked
      // scene exactly as on first load.
      if (reduced.current) {
        if (id === 1) renderDiscoveryResting(root);
        else renderExpertResting(root);
        setFinished(true);
        return;
      }
      setFinished(false);
      const sequence = id === 1 ? playDiscovery : playExpert;
      void sequence(timeline, root).then((done) => {
        if (done) setFinished(true);
      });
    },
    [rootRef, timeline],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reduced motion gets the finished frame in one go and never animates.
    // No gates are installed either: there is nothing running to gate.
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) {
      renderDiscoveryResting(root);
      resetExpert(root);
      setFinished(true);
      return;
    }

    play(1);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.intersectionRatio >= 0.4;
        if (onScreen.current) release();
        else hold();
      },
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
  }, [hold, play, release, rootRef, timeline]);

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

  const restart = useCallback(() => {
    stopped.current = false;
    play(current.current);
  }, [play]);

  const setRate = useCallback(
    (next: number) => {
      timeline.setRate(next);
      setRateState(next);
    },
    [timeline],
  );

  /*
   * Picking a scene by hand clears the sign-in focus stop as well: someone who
   * just clicked a pill is asking to watch it, whatever they were doing before.
   */
  const selectScene = useCallback(
    (id: SceneId) => {
      stopped.current = false;
      setScene(id);
      play(id);
    },
    [play],
  );

  return { paused, rate, finished, scene, toggle, restart, setRate, selectScene };
}
