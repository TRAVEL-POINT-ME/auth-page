import statusCheck from '../../assets/icons/status-check.svg';
import styles from './ExpertScene.module.css';

const SUPPORT_META = 'Anastasia S. · Travel Point support · 15:18';

/** Scene 2's final layout stays mounted; the sequence only changes visibility. */
export function ExpertScene() {
  return (
    <div className={styles.scene} data-expert-scene>
      <article className={styles.card}>
        <header className={styles.header}>
          <strong className={styles.booking}>Booking 1148213</strong>
          <span className={styles.separator}>·</span>
          <span>Hilton Tokyo Hotel</span>
          <span className={styles.separator}>·</span>
          <span>Manager: Anastasia Stanovska</span>
        </header>

        <div className={styles.thread}>
          <div
            className={styles.agentRow}
            data-expert-slot="confirmation"
          >
            <AgentAvatar />
            <div className={styles.primaryAgentContent}>
              <div data-expert-message="confirmation">
                <div className={styles.primaryAgentBubble}>
                  Hi! Your booking is confirmed. We also verified it directly with
                  the hotel — HCN 1711-94, auto-synced to your voucher.
                </div>
                <MessageMeta />
              </div>
              <TypingBubble id="confirmation" />
            </div>
          </div>

          <div className={styles.guestRow} data-expert-slot="request">
            <div className={styles.guestBubble}>
              My client arrives at 01:40 with a dog. Can you confirm late check-in
              and pet accommodation?
            </div>
          </div>

          <div className={styles.agentRow} data-expert-slot="response">
            <AgentAvatar />
            <div className={styles.secondaryAgentContent}>
              <div data-expert-message="response">
                <div className={styles.secondaryAgentBubble}>
                  Of course — I’ll check this with the hotel right away.
                </div>
                <MessageMeta />
              </div>
              <TypingBubble id="response" />
            </div>
          </div>

          <div className={styles.statusSlot} data-expert-slot="resolution">
            <div className={styles.statusCard} data-expert-message="resolution">
              <span className={styles.statusIconTray}>
                <img className={styles.statusIcon} src={statusCheck} alt="" />
              </span>
              <span className={styles.statusCopy}>
                <span className={styles.statusTitle}>
                  <strong>All set:</strong> the hotel has noted the late arrival and
                  dog.
                </span>
                <span className={styles.statusMeta}>
                  Arrival 01:40 · Pet amenities arranged
                </span>
              </span>
            </div>

            <div className={styles.resolutionTyping} data-expert-typing="resolution">
              <AgentAvatar />
              <TypingDots />
            </div>
          </div>

          <div className={styles.thanksRow} data-expert-slot="thanks">
            <div className={styles.thanksBubble}>thank you 🙏</div>
          </div>
        </div>
      </article>
    </div>
  );
}

function AgentAvatar() {
  return <span className={styles.avatar}>AS</span>;
}

function MessageMeta() {
  return <div className={styles.messageMeta}>{SUPPORT_META}</div>;
}

function TypingBubble({ id }: { id: string }) {
  return (
    <div className={styles.typingPosition} data-expert-typing={id}>
      <TypingDots />
    </div>
  );
}

function TypingDots() {
  return (
    <span className={styles.typingBubble}>
      <i />
      <i />
      <i />
    </span>
  );
}
