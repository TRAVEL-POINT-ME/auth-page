import { useRef } from 'react';

import panelMap from '../assets/images/panel-map.webp';
import { cx } from '../lib/cx';
import { motionVars } from './motion';
import './motion.css';
import styles from './PresentationPanel.module.css';
import { DiscoveryScene } from './scenes/DiscoveryScene';
import { ExpertScene } from './scenes/ExpertScene';
import { MapPins } from './scenes/MapPins';
import { SceneSwitcher } from './SceneSwitcher';
import { StageControls } from './StageControls';
import { usePanelScene } from './usePanelScene';

/**
 * The right-hand presentation panel.
 *
 * Full-bleed map behind, a fixed-height stage centred on the panel in front,
 * and the scene switcher along the bottom.
 *
 * Everything except the switcher is `aria-hidden`: it is a decorative
 * explainer, and keyboard focus should run from the sign-in column to the two
 * pills and then to the footer, with nothing in between.
 *
 * The map is one import and one `<img>` — swapping the asset is a one-line
 * change, and the edge treatment that blends it into the panel lives in CSS
 * rather than in the file, so a different map inherits it automatically.
 */
export function PresentationPanel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controls = usePanelScene(rootRef);

  return (
    <div
      className={styles.root}
      ref={rootRef}
      style={motionVars(controls.rate)}
      data-panel
      data-paused={controls.paused || undefined}
    >
      <div className={styles.mapLayer} aria-hidden="true">
        <div className={styles.mapZoom} data-map>
          <div className={styles.mapBox}>
            <img className={styles.mapImage} src={panelMap} alt="" />
            <MapPins />
          </div>
        </div>
      </div>

      <div className={styles.mapVeil} aria-hidden="true" />

      <div className={styles.content} aria-hidden="true">
        <div className={styles.stage}>
          <div
            className={cx(styles.scene, controls.scene === 1 && 'is-active')}
            data-scene="1"
          >
            <DiscoveryScene />
          </div>
          <div
            className={cx(styles.scene, controls.scene === 2 && 'is-active')}
            data-scene="2"
          >
            <ExpertScene />
          </div>
        </div>
      </div>

      <SceneSwitcher scene={controls.scene} onSelect={controls.selectScene} />

      <StageControls {...controls} />
    </div>
  );
}
