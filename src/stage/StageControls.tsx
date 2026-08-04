import type { CSSProperties } from 'react';

import type { DemoControls } from './useDemo';

/**
 * Development-only transport for the demo: play / pause, restart, which scene
 * is showing, and a half-speed review mode for checking a beat by eye.
 *
 * Deliberately styled inline rather than through a stylesheet — the whole
 * module is behind `import.meta.env.DEV`, and a CSS import would survive the
 * production build even when the component itself does not.
 */

const bar: CSSProperties = {
  position: 'absolute',
  insetBlockStart: 12,
  insetInlineStart: 12,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  borderRadius: 8,
  background: 'rgba(13, 1, 34, .72)',
  color: '#fff',
  font: '500 11px/1 ui-monospace, monospace',
};

const button: CSSProperties = {
  padding: '4px 7px',
  border: 0,
  borderRadius: 5,
  background: 'rgba(255, 255, 255, .16)',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

const active: CSSProperties = { ...button, background: '#fff', color: '#0d0122' };

export function StageControls({
  scene,
  paused,
  rate,
  finished,
  toggle,
  restart,
  setRate,
}: DemoControls) {
  return (
    // The stage around this is `aria-hidden`, so nothing in here may be
    // reachable by keyboard — the sign-in column's tab order runs straight past.
    <div style={bar}>
      <button type="button" tabIndex={-1} style={button} onClick={toggle}>
        {paused ? 'play' : 'pause'}
      </button>
      <button type="button" tabIndex={-1} style={button} onClick={restart}>
        restart
      </button>
      <button
        type="button"
        tabIndex={-1}
        style={rate === 0.5 ? active : button}
        onClick={() => setRate(rate === 0.5 ? 1 : 0.5)}
      >
        0.5×
      </button>
      <span>
        scene {scene}/5{finished ? ' · done' : ''}
      </span>
    </div>
  );
}
