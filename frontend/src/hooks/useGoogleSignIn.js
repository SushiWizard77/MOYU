import { useCallback, useEffect, useRef, useState } from "react";

// Google Identity Services, loaded lazily from https://accounts.google.com/gsi/client
const GSI_SCRIPT_ID = "moyu-google-gsi";
const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const loadGsiScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GSI_SCRIPT_ID);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-loaded", "false");
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error("Google sign-in script failed to load"));
    document.head.appendChild(script);
  });

// Human-readable text for the moments Google reports through prompt().
// See https://developers.google.com/identity/gsi/web/reference/js-reference
const NOT_DISPLAYED_REASONS = {
  browser_not_supported: "This browser does not support Google sign-in. Try Chrome, Edge or Safari.",
  invalid_client: "Google sign-in is misconfigured: the Google client ID is not valid.",
  missing_client_id: "Google sign-in is misconfigured: no Google client ID was provided.",
  opt_out_or_no_session: "No signed-in Google account was found. Sign in to Google in this browser, then try again.",
  secure_http_required: "Google sign-in requires HTTPS (or localhost).",
  suppressed_by_user: "Google sign-in was dismissed earlier for this site. Allow third-party sign-in and try again.",
  unregistered_origin: "This site's origin is not registered for the Google client ID.",
  unknown_reason: "Google sign-in could not be displayed. Please try again.",
};

const SKIPPED_REASONS = {
  credential_returned: "Google sign-in was interrupted. Please try again.",
  gsi_2fa_fallback_script: "Google needs an extra verification step. Please try again.",
  issuer_not_supported: "Google sign-in is not available for this account in this browser.",
  no_credential: "No Google account was chosen. Please try again.",
  user_cancel: "Google sign-in was cancelled.",
};

const describeMoment = (notification) => {
  if (!notification) return "";
  if (typeof notification.isNotDisplayed === "function" && notification.isNotDisplayed()) {
    const reason =
      typeof notification.getNotDisplayedReason === "function" ? notification.getNotDisplayedReason() : "unknown_reason";
    return NOT_DISPLAYED_REASONS[reason] || NOT_DISPLAYED_REASONS.unknown_reason;
  }
  if (typeof notification.isSkippedMoment === "function" && notification.isSkippedMoment()) {
    const reason = typeof notification.getSkippedReason === "function" ? notification.getSkippedReason() : "no_credential";
    return SKIPPED_REASONS[reason] || SKIPPED_REASONS.no_credential;
  }
  if (typeof notification.isDismissedMoment === "function" && notification.isDismissedMoment()) {
    return "Google sign-in was dismissed.";
  }
  return "";
};
/**
 * Drives "Continue with Google" for every page that offers it.
 *
 * Google's One Tap prompt (`prompt()`) is best-effort: it renders at Google's
 * discretion and stays completely silent when there is no active Google session,
 * so a custom button built on it looks dead. Instead we mount Google's own
 * button into a container and overlay it on the styled button in the UI, which
 * opens the real Google account chooser on click in every browser.
 *
 * `use_fedcm_for_button` is enabled so Chrome (M125+) and Android (M128+) show
 * the browser's native account chooser. Note that `use_fedcm_for_prompt` is
 * deprecated and must not be used.
 *
 * @param {(credential: string) => Promise<void> | void} onCredential Receives the Google ID token.
 * @param {string} [notConfiguredMessage] Message shown when VITE_GOOGLE_CLIENT_ID is missing.
 */
export function useGoogleSignIn(onCredential, notConfiguredMessage) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const buttonHostRef = useRef(null);
  const callbackRef = useRef(onCredential);

  const configured = Boolean(clientId);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !buttonHostRef.current) return;

        // initialize() is idempotent: Google keeps the latest configuration.
        window.google.accounts.id.initialize({
          client_id: clientId,
          use_fedcm_for_button: true,
          // Keep the account chooser visible instead of silently re-using a session.
          button_auto_select: false,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current?.(response.credential);
            } else {
              setError("Google did not return a sign-in credential. Please try again.");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonHostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: 400,
        });

        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Google sign-in is unavailable right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  /**
   * Fallback for clicks that miss Google's overlay button (usually because the
   * script is still loading or the client ID is missing). Explains the failure
   * instead of leaving the user with nothing.
   */
  const reportUnavailable = useCallback(() => {
    if (!configured) {
      setError(
        notConfiguredMessage ||
          "Google sign-in is not configured for this deployment. Set VITE_GOOGLE_CLIENT_ID and redeploy."
      );
      return;
    }
    if (!ready) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }
    setError("Google sign-in could not start. Please reload the page and try again.");
  }, [configured, notConfiguredMessage, ready]);

  /** One Tap retry, used only if the rendered button never appeared. */
  const promptFallback = useCallback(() => {
    if (!configured || !window.google?.accounts?.id) {
      reportUnavailable();
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      const message = describeMoment(notification);
      if (message) setError(message);
    });
  }, [configured, reportUnavailable]);

  return { configured, ready, error, buttonHostRef, reportUnavailable, promptFallback };
}

export default useGoogleSignIn;