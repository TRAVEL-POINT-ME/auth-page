import hotelPhoto from '../assets/images/lyf-shibuya.jpg';
import { DEMO, euro, nights } from './demo';
import styles from './NetRateScene.module.css';

/**
 * Scene 3 — the best available net rate.
 *
 * This is the card the user will actually see once they are signed in, so it
 * arrives as a finished object: photo, name, rating, address and the two
 * status pills are all part of the resting frame. Only the price line below
 * the divider is revealed — it is the answer scene 2's convergence lands on.
 */
export function NetRateScene() {
  const { property } = DEMO;

  return (
    <>
      <div className={styles.card}>
        <p className={styles.kicker}>Best available net rate</p>

        <div className={styles.property}>
          <img className={styles.photo} src={hotelPhoto} alt="" />

          <div className={styles.details}>
            <p className={styles.name}>{property.name}</p>
            <p className={styles.stars}>{'★'.repeat(property.stars)}</p>
            <p className={styles.address}>{property.address}</p>

            <div className={styles.pills}>
              <span className={styles.pillGreen}>
                Free cancellation until {property.freeCancellationUntil}
              </span>
              <span className={styles.pillPurple}>Breakfast included</span>
            </div>
          </div>
        </div>

        <div className={styles.total} data-reveal="1">
          <p className={styles.totalLabel}>
            Total net rate · {nights(DEMO.nights)}
          </p>
          <p className={styles.totalValue}>{euro(DEMO.netRate)}</p>
        </div>
      </div>

      <div className={styles.captionBlock}>
        <p className={styles.caption}>Your best rate. Already found.</p>
        <p className={styles.captionNote}>
          We compare supplier offers and show you the best available net rate.
        </p>
      </div>
    </>
  );
}
