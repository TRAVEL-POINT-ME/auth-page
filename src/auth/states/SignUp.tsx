import chevronDown from '../../assets/icons/chevron-down.svg';
import chevronUpDown from '../../assets/icons/chevron-up-down.svg';
import {
  BackButton,
  controlStyles,
  cx,
  LabelledField,
  LabelledGroup,
  PrimaryButton,
  TextField,
} from '../ui/controls';
import styles from './SignUp.module.css';

type SignUpProps = {
  onBack: () => void;
};

export function SignUp({ onBack }: SignUpProps) {
  return (
    <section className={cx(controlStyles.column, styles.column)}>
      <div className={styles.intro}>
        <BackButton onClick={onBack} />
        <h1 className={controlStyles.heading}>Start booking today.</h1>
      </div>

      <p className={cx(controlStyles.lede, styles.lede)}>
        Create your account to search and book now.
      </p>

      <div className={styles.form}>
        <div className={styles.fields}>
          <div className={styles.nameRow}>
            <LabelledField label="First name" className={styles.nameField}>
              <TextField name="firstName" autoComplete="given-name" placeholder="Tyler" />
            </LabelledField>
            <LabelledField label="Last name" className={styles.nameField}>
              <TextField name="lastName" autoComplete="family-name" placeholder="Durden" />
            </LabelledField>
          </div>

          <LabelledField label="Work email">
            <TextField
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@travel-agency.com"
              highlighted
            />
          </LabelledField>

          <LabelledGroup label="Country">
            {(labelId) => (
              <button type="button" className={styles.dropdown} aria-labelledby={labelId}>
                Country or region
                <img className={styles.dropdownChevron} src={chevronUpDown} alt="" />
              </button>
            )}
          </LabelledGroup>

          <LabelledGroup label="Phone number">
            {(labelId) => (
              <div className={styles.phoneRow}>
                <button
                  type="button"
                  className={styles.dialCode}
                  aria-label="Country calling code, currently +1"
                >
                  <span className={styles.dialFlag}>🇺🇸</span>
                  <span className={styles.dialNumber}>+1</span>
                  <img className={styles.dialChevron} src={chevronDown} alt="" />
                </button>
                <TextField
                  type="tel"
                  name="phone"
                  autoComplete="tel-national"
                  placeholder=" 202-888-0123"
                  className={styles.phoneField}
                  aria-labelledby={labelId}
                />
              </div>
            )}
          </LabelledGroup>

          <LabelledGroup label="Company">
            {(labelId) => (
              <button type="button" className={styles.dropdown} aria-labelledby={labelId}>
                Agency name
              </button>
            )}
          </LabelledGroup>
        </div>

        <PrimaryButton>Create account and start booking</PrimaryButton>
      </div>

      <p className={styles.legal}>
        By creating an account, you agree to our{' '}
        <a className={controlStyles.inlineLink} href="#terms">
          Terms
        </a>{' '}
        and{' '}
        <a className={controlStyles.inlineLink} href="#privacy">
          Privacy Policy
        </a>
        .
      </p>
    </section>
  );
}
