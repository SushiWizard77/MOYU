import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Orbit,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Starfield from "../components/Starfield";
import { useAuth } from "../hooks/useAuth";

const PERKS = [
  { icon: Orbit, text: "Personal orbit plan" },
  { icon: Star, text: "Daily star missions" },
  { icon: CheckCircle2, text: "Placement tracking" },
];

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleInitializedRef = useRef(false);
  const googlePromptTimeoutRef = useRef(null);
  const googleCredentialHandlerRef = useRef(null);

  useEffect(() => {
    googleCredentialHandlerRef.current = async (response) => {
      if (googlePromptTimeoutRef.current) {
        clearTimeout(googlePromptTimeoutRef.current);
        googlePromptTimeoutRef.current = null;
      }
      setError("");
      setLoading(true);
      try {
        const res = await googleLogin(response.credential);
        if (res.success) {
          navigate("/dashboard");
        } else {
          setError(res.message || "Google sign-in failed. Please try again.");
        }
      } catch (err) {
        setError(err.message || "Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  }, [googleLogin, navigate]);

  useEffect(() => {
    if (!googleClientId) return undefined;
    let cancelled = false;
    const initializeGoogle = () => {
      if (cancelled || googleInitializedRef.current || !window.google?.accounts) return;
      googleInitializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => googleCredentialHandlerRef.current?.(response),
      });
    };
    if (window.google?.accounts) {
      initializeGoogle();
      return undefined;
    }
    const existingScript = document.getElementById("moyu-google-gsi");
    if (existingScript) {
      const handleLoad = () => initializeGoogle();
      existingScript.addEventListener("load", handleLoad);
      if (existingScript.getAttribute("data-loaded") === "true") initializeGoogle();
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", handleLoad);
      };
    }
    const script = document.createElement("script");
    script.id = "moyu-google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-loaded", "false");
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      initializeGoogle();
    };
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [googleClientId]);

  const handleGoogleLogin = () => {
    if (!googleClientId) {
      setError("Google sign-in is not configured. Ask the administrator to add a Google client ID.");
      return;
    }
    if (!window.google?.accounts) {
      setError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }
    setError("");
    setLoading(true);
    googlePromptTimeoutRef.current = setTimeout(() => setLoading(false), 15000);
    window.google.accounts.id.prompt();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#1d4fd7_0%,#0a1f44_45%,#030b1e_75%)]" />
      <div className="absolute inset-0 cosmic-grid opacity-70" />
      <Starfield density={170} />
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px]" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-nebula/20 blur-[120px]" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <Link to="/" className="animate-moyu-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-brand-200 backdrop-blur transition hover:bg-white/10">
            <ArrowLeft size={14} /> Back to mission base
          </Link>
          <div className="animate-moyu-rise-1 mt-8">
            <Logo size={54} tagline="Placement Universe" />
          </div>
          <h1 className="animate-moyu-rise-2 mt-8 max-w-md text-5xl font-black leading-[1.05] tracking-tight">
            Welcome back,
            <span className="block bg-gradient-to-r from-starlight via-brand-200 to-brand-400 bg-clip-text text-transparent">
              star voyager.
            </span>
          </h1>
          <p className="animate-moyu-rise-3 mt-5 max-w-md leading-7 text-lavender-300">
            Your orbit is waiting. Sign in to continue your placement flight.
          </p>
          <div className="animate-moyu-rise-3 mt-8 space-y-3">
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.text} className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-lavender-100 backdrop-blur">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30">
                    <Icon size={17} />
                  </span>
                  {perk.text}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-lavender-300 transition hover:text-white lg:hidden">
            <ArrowLeft size={16} /> Back to MOYU
          </Link>
          <div className="animate-moyu-rise relative overflow-hidden rounded-[28px] border border-white/40 bg-white p-7 text-brand-800 shadow-[0_30px_80px_-20px_rgba(3,11,30,0.55)] sm:p-9">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-200/50 blur-[70px]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="lg:hidden"><Logo size={40} dark /></div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">
                  <Sparkles size={12} /> Mission login
                </span>
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-brand-800 sm:text-4xl">Continue your flight</h2>
              <p className="mt-2 text-sm leading-6 text-brand-800/65">Enter your coordinates to re-enter the MOYU universe.</p>
              {error && (
                <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-800">College Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required disabled={loading} className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-4 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-brand-800">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-brand-600 transition hover:text-brand-800">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required disabled={loading} className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-12 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 transition hover:text-brand-700 disabled:opacity-50" aria-label="Toggle password">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="shine-button flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_45px_-12px_rgba(10,31,68,0.65)] transition hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                  <Rocket size={17} />{loading ? "Launching..." : "Launch dashboard"}
                </button>
              </form>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-brand-800/60">
                <ShieldCheck size={15} className="text-emerald-600" /> Secure student authentication
              </div>
              <div className="mt-5 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.1em] text-brand-500 bg-white px-2">
                  Or continue with
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/50 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
              <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-center text-sm text-brand-800/75">
                New to this galaxy?{" "}<Link to="/register" className="font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition hover:text-brand-800">Create your account</Link>
              </div>
              <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-800/45">MOYU · Learn. Practice. Get Placed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
