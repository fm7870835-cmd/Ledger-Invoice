import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface SignUpProps {
  currentUser: User | null;
  onNavigateDashboard: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ currentUser, onNavigateDashboard }) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Helper to parse Firebase auth errors into human-readable messages
  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please double check and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.';
      case 'auth/too-many-requests':
        return 'Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.';
      default:
        return 'An error occurred during authentication. Please check your credentials and connection.';
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Client-side Validations
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!isLoginMode) {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please ensure both passwords match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        // Sign In Flow
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage('Successfully signed in!');
        setTimeout(() => {
          onNavigateDashboard();
        }, 1200);
      } else {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Send Email Verification Link
        try {
          await sendEmailVerification(user);
          setVerificationSent(true);
        } catch (verificationError) {
          console.warn('Failed to send email verification:', verificationError);
        }

        setSuccessMessage(
          `Account created successfully! Verification email sent to ${user.email}.`
        );

        setTimeout(() => {
          onNavigateDashboard();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const code = err.code || '';
      setErrorMessage(getFriendlyErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccessMessage('Signed out successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 pb-12">
      {/* Header Banner */}
      <div className="bg-[#f7f4e7] border-2 border-[#822426] p-6 shadow-xs text-center">
        <div className="w-12 h-12 bg-[#822426] text-white flex items-center justify-center rounded-full mx-auto mb-3">
          <span className="material-symbols-outlined text-2xl">lock</span>
        </div>
        <h1 className="font-headline-md text-2xl text-[#1c1c15]">
          {currentUser
            ? 'Account Active'
            : isLoginMode
            ? 'Sign In to Ledger'
            : 'Create Your Account'}
        </h1>
        <p className="font-body-md text-xs text-[#564241] mt-1">
          {currentUser
            ? `Logged in as ${currentUser.email}`
            : isLoginMode
            ? 'Welcome back! Enter your email and password below.'
            : 'Register with email & password using Firebase Authentication.'}
        </p>
      </div>

      {/* If already logged in banner */}
      {currentUser ? (
        <div className="bg-white border border-[#ddc0be] p-6 space-y-4 text-center shadow-xs">
          <div className="p-3 bg-[#e6f4ea] border border-[#bbeecc] text-[#1e4620] text-sm">
            <p className="font-bold">You are currently logged in!</p>
            <p className="text-xs mt-0.5">Email: {currentUser.email}</p>
            <p className="text-[11px] mt-1 font-mono">
              Email Verified:{' '}
              {currentUser.emailVerified ? (
                <span className="text-green-700 font-bold">VERIFIED</span>
              ) : (
                <span className="text-amber-700 font-bold">PENDING VERIFICATION</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onNavigateDashboard}
              className="w-full py-3 bg-[#822426] text-white font-label-md text-xs uppercase tracking-wider hover:bg-[#a23b3b] transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 border border-[#ba1a1a] text-[#ba1a1a] font-label-md text-xs uppercase hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        /* Sign Up / Sign In Form Card */
        <div className="bg-white border border-[#ddc0be] p-6 md:p-8 shadow-xs space-y-6">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 bg-[#ffdad6]/40 border-l-4 border-[#ba1a1a] text-[#ba1a1a] text-xs flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
              <div>
                <p className="font-bold mb-0.5">Authentication Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="p-4 bg-[#e6f4ea] border-l-4 border-[#1e4620] text-[#1e4620] text-xs flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                check_circle
              </span>
              <div>
                <p className="font-bold mb-0.5">Success!</p>
                <p>{successMessage}</p>
                {verificationSent && (
                  <p className="mt-1 text-[11px] font-semibold text-[#143818]">
                    ✉️ Check your inbox for the verification link.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
              />
            </div>

            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
                />
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-[#822426] text-white font-label-md text-sm uppercase tracking-widest hover:bg-[#a23b3b] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : isLoginMode ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-4 border-t border-[#ddc0be] text-center">
            <p className="font-body-md text-xs text-[#564241]">
              {isLoginMode ? "Don't have an account yet?" : 'Already registered?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="mt-1 font-label-md text-xs text-[#822426] font-bold underline hover:text-[#a23b3b] cursor-pointer uppercase"
            >
              {isLoginMode ? 'Register New Account' : 'Sign In to Existing Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
