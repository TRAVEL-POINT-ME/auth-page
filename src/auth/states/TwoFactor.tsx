import envelope from '../../assets/icons/envelope.svg';
import {
  BackButton,
  controlStyles,
  cx,
  GhostButton,
} from '../ui/controls';
import styles from './TwoFactor.module.css';

const DIGITS = [0, 1, 2, 3, 4, 5];

type TwoFactorProps = {
  email: string;
  onBack: () => void;
  onChangeEmail: () => void;
};

export function TwoFactor({ email, onBack, onChangeEmail }: TwoFactorProps) {
  return (
    <section className={controlStyles.column}>
      <div className={styles.intro}>
        <BackButton onClick={onBack} />
        <h1 className={controlStyles.heading}>Check your inbox.</h1>
      </div>

      <p className={cx(controlStyles.lede, styles.lede)}>
        Enter the 6-digit code we just sent.
      </p>

      <div className={styles.recipient}>
        <img className={styles.recipientIcon} src={envelope} alt="" />
        <span className={styles.recipientAddress}>{email}</span>
        <GhostButton className={styles.change} onClick={onChangeEmail}>
          Change
        </GhostButton>
      </div>

      <div className={styles.code}>
        {DIGITS.map((index) => (
          <input
            key={index}
            className={cx(styles.digit, index === 0 && styles.digitActive)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Digit ${index + 1} of 6`}
          />
        ))}
      </div>

      <div className={styles.timers}>
        <span className={styles.expiry}>Expires in 9:43</span>
        <GhostButton className={styles.resend} disabled>
          Resend in 41s
        </GhostButton>
      </div>

      <p className={styles.fallback}>
        Still nothing? Check spam, or{' '}
        <a
          className={cx(controlStyles.inlineLink, styles.fallbackLink)}
          href="#support"
        >
          ask support to sign you in
        </a>
        .
      </p>
    </section>
  );
}
