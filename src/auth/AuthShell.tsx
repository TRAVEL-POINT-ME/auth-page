import type { ReactNode } from 'react';

import logoDot from '../assets/icons/logo-dot.svg';
import { PresentationPanel } from '../panel/PresentationPanel';
import styles from './AuthShell.module.css';

/**
 * The frame every auth state shares: wordmark, the auth column slot, the
 * Terms / Privacy footer, and the grey presentation panel on the right.
 *
 * `data-auth-column` marks the column the panel watches: the demo stops for
 * good the moment a field in here takes focus.
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

          <main className={styles.zoneMain} data-auth-column>
            {children}
          </main>

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
          <PresentationPanel />
        </div>
      </div>
    </div>
  );
}
