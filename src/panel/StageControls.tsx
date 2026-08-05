import type { CSSProperties } from 'react';

import type { PanelControls } from './usePanelScene';

/**
 * Dev-only transport for reviewing the sequence. Never ships: the caller wraps
 * it in `import.meta.env.DEV`. Everything is `tabIndex={-1}` so it cannot pull
 * keyboard focus out of the sign-in form beside it.
 *
 * The 0.25x is the important one — the form-to-map handoff is a 380ms
 * crossfade, which is not reviewable at full speed.
 */
export function StageControls({
  paused,
  rate,
  finished,
  toggle,
  restart,
  setRate,
}: PanelControls) {
  return (
    <div style={bar}>
      <button type="button" tabIndex={-1} style={button} onClick={toggle}>
        {paused ? 'play' : 'pause'}
      </button>
      <button type="button" tabIndex={-1} style={button} onClick={restart}>
        restart
      </button>
      {[0.25, 0.5, 1].map((option) => (
        <button
          key={option}
          type="button"
          tabIndex={-1}
          style={rate === option ? activeButton : button}
          onClick={() => setRate(option)}
        >
          {option}×
        </button>
      ))}
      <span style={readout}>{finished ? 'done' : 'playing'}</span>
    </div>
  );
}

const bar: CSSProperties = {
  position: 'absolute',
  insetInlineStart: 16,
  insetBlockEnd: 16,
  zIndex: 5,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: 6,
  borderRadius: 8,
  background: 'rgba(13, 1, 34, 0.72)',
  font: '11px/1 ui-monospace, SFMono-Regular, Menlo, monospace',
  color: '#ffffff',
};

const button: CSSProperties = {
  padding: '4px 7px',
  borderRadius: 5,
  border: 0,
  background: 'rgba(255, 255, 255, 0.14)',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

const activeButton: CSSProperties = {
  ...button,
  background: '#6a4ce2',
};

const readout: CSSProperties = {
  paddingInline: 4,
  opacity: 0.7,
};
