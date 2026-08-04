import { clientPrice, DEMO, euro, margin, nights } from './demo';
import styles from './MarkupScene.module.css';

/**
 * Scene 4 — markup and margin.
 *
 * The card's label and its divider lines are the resting frame; each row's
 * contents are revealed in turn. Nothing counts up here — the numbers fade in
 * at their final figure, because a settled calculation should not look like it
 * is still being worked out.
 *
 * Only the net rate is read from the config. The markup is applied to it and
 * the two figures below fall out of that, so this card can never disagree with
 * scenes 2 and 3.
 */
export function MarkupScene() {
  return (
    <>
      <div className={styles.card}>
        <p className={styles.kicker}>ILLUSTRATIVE EXAMPLE</p>

        <div className={styles.rows}>
          <div className={styles.row}>
            <div className={styles.rowInner} data-reveal="1">
              <span className={styles.rowLabel}>
                Net rate, {nights(DEMO.nights)}
              </span>
              <span className={styles.rowValue}>{euro(DEMO.netRate)}</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInner} data-reveal="2">
              <span className={styles.rowLabel}>Your markup</span>
              <span className={styles.rowValueAccent}>
                + {DEMO.markupPct}%
              </span>
            </div>
          </div>

          <div className={styles.row}>
            {/*
              The payoff line needs a beat of silence before it, so this row
              holds for 200ms on top of the usual stagger.
            */}
            <div className={styles.rowInner} data-reveal="3" data-reveal-hold="200">
              <span className={styles.rowLabel}>Client pays</span>
              <span className={styles.rowValue}>{euro(clientPrice)}</span>
            </div>
          </div>
        </div>

        {/* 160ms, so the footnote lands at 1380 as the beat sheet has it. */}
        <div className={styles.keep} data-reveal="4" data-reveal-hold="160">
          <span className={styles.rowLabel}>You keep</span>
          <span className={styles.keepValue}>{euro(margin)}</span>
        </div>

        <p className={styles.disclaimer} data-reveal="5">
          Example based on a {DEMO.markupPct}% markup. You set your client price
          independently.
        </p>
      </div>

      <div className={styles.captionBlock}>
        <p className={styles.caption}>Better net rates. More room to earn.</p>
        <p className={styles.captionNote}>
          Use our best available net rates as the base for your own markup.
        </p>
      </div>
    </>
  );
}
