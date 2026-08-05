import { useId } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import chevronLeft from '../../assets/icons/chevron-left.svg';
import { cx } from '../../lib/cx';
import styles from './controls.module.css';

export { styles as controlStyles, cx };

type LabelledFieldProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

/** Label + control, for a single native input. */
export function LabelledField({ label, className, children }: LabelledFieldProps) {
  return (
    <label className={className}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

/**
 * Label + control for groups that are not a single labelable input — the
 * button-based dropdowns and the split phone row. The caller wires the control
 * to the label id it is handed.
 */
export function LabelledGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (labelId: string) => ReactNode;
}) {
  const labelId = useId();
  return (
    <div className={className}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      {children(labelId)}
    </div>
  );
}

export function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cx(styles.field, className)} />
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} className={cx(styles.primaryButton, className)}>
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} className={cx(styles.ghostButton, className)}>
      {children}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <GhostButton className={styles.backButton} onClick={onClick}>
      <img className={styles.backIcon} src={chevronLeft} alt="" />
      Back to sign in
    </GhostButton>
  );
}
