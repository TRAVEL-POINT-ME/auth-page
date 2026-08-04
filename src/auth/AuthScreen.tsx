import { useState } from 'react';

import { AuthShell } from './AuthShell';
import { SignIn } from './states/SignIn';
import { SignUp } from './states/SignUp';
import { TwoFactor } from './states/TwoFactor';

/** The three states of the single auth flow. */
export type AuthState = 'signIn' | 'signUp' | 'verify';

/** The address Figma shows on the 2FA state before anything has been typed. */
const PLACEHOLDER_EMAIL = 'name@travel-agency.com';

export function AuthScreen() {
  const [state, setState] = useState<AuthState>('signIn');

  return (
    <AuthShell>
      {state === 'signIn' && (
        <SignIn
          onRequestCode={() => setState('verify')}
          onSignUp={() => setState('signUp')}
        />
      )}

      {state === 'signUp' && <SignUp onBack={() => setState('signIn')} />}

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
