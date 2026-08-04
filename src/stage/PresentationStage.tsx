import { useRef } from 'react';

import { MarkupScene } from './MarkupScene';
import { motionVars } from './motion';
import './motion.css';
import { NetRateScene } from './NetRateScene';
import styles from './PresentationStage.module.css';
import { RateComparisonScene } from './RateComparisonScene';
import { SearchFormScene } from './SearchFormScene';
import { StageControls } from './StageControls';
import { SupportScene } from './SupportScene';
import { useDemo } from './useDemo';

/**
 * The right-hand product demo: five scenes, one after another, in a container
 * whose height never changes.
 *
 * That fixed height is the whole point of swapping scenes rather than
 * appending them — the sign-in form to its left must not move while the demo
 * plays. Every scene is absolutely positioned and centred inside the stage,
 * and only one carries `.is-active` at a time.
 *
 * The stage is decorative: it is hidden from assistive technology and nothing
 * inside it is focusable, so keyboard focus goes from the sign-in column
 * straight to the page footer.
 */
export function PresentationStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const footnoteRef = useRef<HTMLParagraphElement>(null);
  const demo = useDemo(stageRef, footnoteRef);

  return (
    <div className={styles.root} style={motionVars(demo.rate)} aria-hidden="true">
      <div className={styles.stage} ref={stageRef} data-stage>
        <div className={styles.scene} data-scene="1">
          <SearchFormScene />
          <p className={styles.caption}>
            You search once.
            <br />
            <span className={styles.captionMuted}>We check everything.</span>
          </p>
        </div>

        <div className={styles.scene} data-scene="2">
          <RateComparisonScene />
        </div>

        <div className={styles.scene} data-scene="3">
          <NetRateScene />
        </div>

        <div className={styles.scene} data-scene="4">
          <MarkupScene />
        </div>

        <div className={styles.scene} data-scene="5">
          <SupportScene />
        </div>
      </div>

      {/*
        The annotation that sits outside the cards. It belongs to the stage
        rather than to a scene: once scene 3 brings it in it stays for the rest
        of the pass, which is how Figma shows it on scenes 3 to 5.
      */}
      <p className={styles.footnote} ref={footnoteRef} data-fade>
        Example data. Live results may vary.
      </p>

      {import.meta.env.DEV && <StageControls {...demo} />}
    </div>
  );
}
