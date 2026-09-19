import { useEffect } from "react";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";

const GoogleGlyph = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/**
 * "Continue with Google" button.
 *
 * Google's own button is mounted invisibly on top of the styled button, so the
 * user keeps the MOYU design while the click lands on Google's real button and
 * opens the Google account chooser (popup, or the browser's native FedCM dialog).
 *
 * @param {object} props
 * @param {(credential: string) => Promise<void> | void} props.onCredential Google ID token handler.
 * @param {(message: string) => void} [props.onError] Surfaces configuration/load problems.
 * @param {boolean} [props.disabled]
 * @param {string} [props.label]
 */
function GoogleSignInButton({ onCredential, onError, disabled = false, label = "Continue with Google" }) {
  const { configured, ready, error, buttonHostRef, reportUnavailable, promptFallback } = useGoogleSignIn(onCredential);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const overlayActive = ready && !disabled;

  const handleStyledClick = () => {
    // No client ID at all: explain the real configuration problem.
    if (!configured) {
      reportUnavailable();
      return;
    }

    // Google's button is not in place yet (slow or blocked script). One Tap is the
    // best remaining shot from inside the click gesture, and it reports back a
    // precise reason when it cannot be shown.
    promptFallback();
  };

  // Google caps its button width at 400px, so clicks on the leftover edges of our
  // wider button land on the overlay itself. Forward them to Google's button while
  // we are still inside the user's click gesture.
  const handleOverlayClick = (event) => {
    if (event.target !== buttonHostRef.current) return; // landed on Google's button

    const googleButton =
      buttonHostRef.current.querySelector("div[role=button]") || buttonHostRef.current.firstElementChild;
    googleButton?.click();
  };

  return (
    <div className="relative mt-4 rounded-2xl focus-within:ring-4 focus-within:ring-brand-500/20">
      <button
        type="button"
        onClick={handleStyledClick}
        disabled={disabled}
        aria-hidden={overlayActive ? "true" : undefined}
        tabIndex={overlayActive ? -1 : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/50 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleGlyph />
        <span>{label}</span>
      </button>

      {/* Google's real button, invisible but clickable, sitting on top. */}
      <div
        ref={buttonHostRef}
        onClick={handleOverlayClick}
        className={`absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-2xl opacity-0 ${
          overlayActive ? "" : "pointer-events-none"
        }`}
      />
    </div>
  );
}

export default GoogleSignInButton;