import type { CSSProperties } from 'react';

import mapPin from '../../assets/icons/map-pin.svg';
import { PINS } from './discovery.data';
import styles from './DiscoveryScene.module.css';

/**
 * The pins that land on the map.
 *
 * Rendered inside the map's cover box rather than in the stage, so that when
 * the map is cropped at a viewport shape other than the design's, the pins are
 * cropped with it and stay on their roads.
 *
 * One asset at six sizes: Figma exports the pin at three scales, but the paths
 * are the same shape scaled exactly, so a single SVG covers all of them —
 * including the three smaller ones that are not in the design.
 *
 * `--pin-beat` is the whole stagger. `motion.css` multiplies it by the stagger
 * duration, so six landings come out of one class toggle and nothing is
 * scheduled per pin. It comes from the pin's own data rather than its position
 * in the array — the gaps between landings are uneven on purpose.
 */
export function MapPins() {
  return (
    <div className={styles.pins} data-pins>
      {PINS.map((pin) => (
        <span
          key={pin.id}
          className={styles.pin}
          style={
            {
              left: pin.left,
              top: pin.top,
              width: pin.width,
              height: pin.height,
              '--pin-beat': pin.beat,
            } as CSSProperties
          }
          data-pin
        >
          <img className={styles.pinArt} src={mapPin} alt="" />
        </span>
      ))}
    </div>
  );
}
