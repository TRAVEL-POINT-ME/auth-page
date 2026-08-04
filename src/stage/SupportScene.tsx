import checkIcon from '../assets/icons/check.svg';
import { DEMO } from './demo';
import styles from './SupportScene.module.css';

/**
 * Scene 5 — the support conversation.
 *
 * The thread is laid out in full from the moment the scene enters and every
 * message is simply invisible, so a message arriving never moves the one above
 * it. The typing indicator shares a grid cell with the reply it stands in for,
 * which is what lets the two cross-fade in place.
 */
export function SupportScene() {
  const { support } = DEMO;

  return (
    <>
      <div className={styles.card}>
        <p className={styles.kicker}>Booking {support.bookingRef} · support</p>

        <div className={styles.thread}>
          <div className={styles.outboundRow}>
            <p className={styles.outbound} data-chat-message="1">
              My client arrives at {support.arrival} with a dog. Could you
              arrange late check-in and pet amenities?
            </p>
          </div>

          <div className={styles.inboundRow}>
            <span className={styles.avatar}>{support.agentInitials}</span>

            <div className={styles.inboundColumn}>
              <div className={styles.bubbleSlot}>
                <p className={styles.inbound} data-chat-message="2">
                  On it. I’m confirming late arrival and pet amenities with the
                  hotel now.
                </p>

                <span className={styles.typing} data-chat-typing aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
              </div>

              <p className={styles.meta} data-chat-message="3">
                {support.agent} · Travel Point support · {support.sentAt}
              </p>
            </div>
          </div>

          <div className={styles.statusRow}>
            <div className={styles.status} data-chat-message="4">
              <span className={styles.check} data-chat-check>
                <img src={checkIcon} alt="" />
              </span>

              <div>
                <p className={styles.statusTitle}>
                  <span className={styles.statusOk}>Confirmed</span> with the
                  hotel
                </p>
                <p className={styles.statusMeta}>
                  Arrival {support.arrival} · Pet amenities arranged
                </p>
              </div>
            </div>
          </div>

          <div className={styles.outboundRow}>
            <p className={styles.outboundShort} data-chat-message="5">
              thank you 🙏
            </p>
          </div>
        </div>
      </div>

      <div className={styles.captionBlock}>
        <p className={styles.caption}>
          <span className={styles.captionMuted}>Beyond the booking.</span>
          <br />
          We handle the details.
        </p>
        <p className={styles.captionNarrow}>
          From late arrivals to special requests, our dedicated team coordinates
          directly with the hotel.
        </p>
      </div>
    </>
  );
}
