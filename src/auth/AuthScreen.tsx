import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { AuthShell } from './AuthShell';
import { SignIn } from './states/SignIn';
import { SignUp } from './states/SignUp';
import { TwoFactor } from './states/TwoFactor';

/** The three states of the single auth flow. */
export type AuthState = 'signIn' | 'signUp' | 'verify';

/** The address Figma shows on the 2FA state before anything has been typed. */
const PLACEHOLDER_EMAIL = 'name@travel-agency.com';

type AuthDirection = 'forward' | 'backward';

type AuthViewTransition = {
  finished: Promise<void>;
  skipTransition: () => void;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => AuthViewTransition;
};

export function AuthScreen() {
  const [state, setState] = useState<AuthState>('signIn');
  const activeTransition = useRef<AuthViewTransition | null>(null);

  /**
   * Sign in and sign up differ enough in height that an instant swap reads as
   * a layout jump. The native transition snapshots the stable main region, so
   * React can still replace the form normally without keeping two interactive
   * copies mounted. Unsupported and reduced-motion browsers swap immediately.
   */
  const moveBetweenEntryForms = (next: AuthState, direction: AuthDirection) => {
    const viewDocument = document as ViewTransitionDocument;

    if (
      !viewDocument.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setState(next);
      return;
    }

    activeTransition.current?.skipTransition();
    document.documentElement.dataset.authDirection = direction;

    const transition = viewDocument.startViewTransition(() => {
      flushSync(() => setState(next));
    });

    activeTransition.current = transition;
    void transition.finished.finally(() => {
      if (activeTransition.current !== transition) return;
      activeTransition.current = null;
      delete document.documentElement.dataset.authDirection;
    });
  };

  return (
    <AuthShell>
      {state === 'signIn' && (
        <SignIn
          onRequestCode={() => setState('verify')}
          onSignUp={() => moveBetweenEntryForms('signUp', 'forward')}
        />
      )}

      {state === 'signUp' && (
        <SignUp onBack={() => moveBetweenEntryForms('signIn', 'backward')} />
      )}

      {state === 'verify' && (
        <TwoFactor
          email={PLACEHOLDER_EMAIL}
          onBack={() => setState('signIn')}
          onChangeEmail={() => setState('signIn')}
        />
      )}
    </AuthShell>
  );
}
