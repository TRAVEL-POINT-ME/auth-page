import { useRef } from 'react';

import panelMap from '../assets/images/panel-map.webp';
import { cx } from '../lib/cx';
import { motionVars } from './motion';
import './motion.css';
import styles from './PresentationPanel.module.css';
import { DiscoveryScene } from './scenes/DiscoveryScene';
import { StageControls } from './StageControls';
import { usePanelScene } from './usePanelScene';

/**
 * The right-hand presentation panel.
 *
 * Full-bleed map behind, a fixed-height stage centred on the panel in front.
 * The whole thing is `aria-hidden`: it is a decorative explainer, and keyboard
 * focus should run from the sign-in column straight to the footer.
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
      aria-hidden="true"
    >
      <div className={styles.mapLayer} data-map>
        <img className={styles.mapImage} src={panelMap} alt="" />
      </div>

      <div className={styles.content}>
        <div className={styles.stage}>
          <div className={cx(styles.scene, 'is-active')} data-scene="1">
            <DiscoveryScene />
          </div>
        </div>
      </div>

      {import.meta.env.DEV && <StageControls {...controls} />}
    </div>
  );
}
