import arrowRight from '../../assets/icons/arrow-right.svg';
import googleIcon from '../../assets/icons/google.svg';
import {
  controlStyles,
  cx,
  GhostButton,
  LabelledField,
  PrimaryButton,
  TextField,
} from '../ui/controls';
import styles from './SignIn.module.css';

type SignInProps = {
  onRequestCode: () => void;
  onSignUp: () => void;
};

export function SignIn({ onRequestCode, onSignUp }: SignInProps) {
  return (
    <section className={cx(controlStyles.column, styles.column)}>
      <h1 className={styles.heading}>
        Book at net.
        <br />
        Sell at <span className={styles.headingAccent}>your price</span>.
      </h1>

      <p className={cx(controlStyles.lede, styles.lede)}>
        2M+ properties worldwide. Flexible payments.
        <br />
        Dedicated expert support.
      </p>

      <button
        type="button"
        className={cx(controlStyles.secondaryButton, styles.googleButton)}
      >
        <img className={styles.googleIcon} src={googleIcon} alt="" />
        Continue with Google
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerRule} />
        <span className={styles.dividerLabel}>or</span>
        <span className={styles.dividerRule} />
      </div>

      <div className={styles.form}>
        <LabelledField label="Work email">
          <TextField
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@travel-agency.com"
            className={styles.emailField}
          />
        </LabelledField>

        <PrimaryButton className={styles.submit} onClick={onRequestCode}>
          Send sign-in code
        </PrimaryButton>
      </div>

      <p className={styles.note}>
        We’ll email a 6-digit code. It expires in 10 minutes.
      </p>

      <div className={styles.prompt}>
        <span className={styles.promptText}>New to Travel Point?</span>
        <GhostButton className={styles.promptAction} onClick={onSignUp}>
          Sign Up
          <img className={styles.promptIcon} src={arrowRight} alt="" />
        </GhostButton>
      </div>
    </section>
  );
}
