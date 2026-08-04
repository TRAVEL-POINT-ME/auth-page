import type { ReactNode } from 'react';

import logoDot from '../assets/icons/logo-dot.svg';
import styles from './AuthShell.module.css';

/**
 * The frame every auth state shares: wordmark, the auth column slot, the
 * Terms / Privacy footer, and the grey presentation panel on the right.
 *
 * The panel is an empty slot: its geometry is fixed by the layout, its content
 * is not built yet.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.zone}>
          <header className={styles.zoneHeader}>
            <span className={styles.wordmark}>
              travelpoint
              <img className={styles.wordmarkDot} src={logoDot} alt="" />
            </span>
          </header>

          <main className={styles.zoneMain}>{children}</main>

          <footer className={styles.zoneFooter}>
            <a className={styles.footerLink} href="#terms">
              Terms
            </a>
            <a className={styles.footerLink} href="#privacy">
              Privacy
            </a>
          </footer>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelInner} />
        </div>
      </div>
    </div>
  );
}
