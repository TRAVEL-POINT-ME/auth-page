import { DEMO, euro } from './demo';
import styles from './RateComparisonScene.module.css';

/**
 * Scene 2 — backstage rate comparison.
 *
 * This is the one scene that is not a screen the user operates: it is the work
 * the platform does between the search and the result. Nothing in it is
 * interactive, nothing reacts to the pointer, and every number starts at zero.
 *
 * The axis and its end labels are part of the resting frame. The counters, the
 * dots and the best-rate label are all placed by the timeline — the dot
 * template below is cloned once per quote.
 */
export function RateComparisonScene() {
  return (
    <>
      <div className={styles.card}>
        <p className={styles.kicker}>Behind every search.</p>

        <p className={styles.summary}>
          <strong data-counter="1">0</strong> <strong>sources</strong> checked{' '}
          <span className={styles.arrow} data-counter-link data-fade>
            →
          </span>{' '}
          <strong>
            <span data-counter="2">0</span> live
          </strong>{' '}
          rates for the room
        </p>

        <div className={styles.plot}>
          <div className={styles.band} data-spread-track>
            <span className={styles.dot} data-quote-template hidden />
          </div>

          <div className={styles.axis} data-spread-axis />
          <p className={styles.axisStart}>lowest</p>
          <p className={styles.axisEnd}>highest</p>

          <div className={styles.best} data-best-label data-fade>
            <p className={styles.bestValue}>{euro(DEMO.netRate)}</p>
            <p className={styles.bestCaption}>Best net rate</p>
          </div>
        </div>
      </div>

      <p className={styles.caption}>
        <span className={styles.captionMuted}>We do the hard work.</span>
        <br />
        You get the best available rate.
      </p>
    </>
  );
}
