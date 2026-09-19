import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail, Rocket, ShieldCheck, Sparkles, User } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Logo from "../components/Logo";
import Starfield from "../components/Starfield";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError("");
      setSuccess("");
      setLoading(true);
      try {
        const res = await googleLogin(credential);
        if (res.success) {
          navigate("/dashboard");
        } else {
          setError(res.message || "Google sign-up failed. Please try again.");
        }
      } catch (err) {
        setError(err.message || "Google sign-up failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [googleLogin, navigate]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      setSuccess("Account created! Preparing your launch...");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            <ArrowLeft size={14} /> Back to base
          </Link>
          <div className="animate-moyu-rise-1 mt-8"><Logo size={54} tagline="Placement Universe" /></div>
          <h1 className="animate-moyu-rise-2 mt-8 max-w-md text-5xl font-black leading-[1.05] text-white">Begin your star mission.</h1>
          <p className="animate-moyu-rise-3 mt-5 max-w-md leading-7 text-lavender-200">One account unlocks roadmaps and missions.</p>
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
                  <Sparkles size={12} /> New cadet
                </span>
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-brand-800 sm:text-4xl">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-brand-800/65">Start your placement journey among the stars.</p>
              {error && (<div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>)}
              {success && (<div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>)}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-800">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required disabled={loading} className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-4 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-800">College Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required disabled={loading} className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-4 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-800">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required minLength={6} disabled={loading} className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-12 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 transition hover:text-brand-700 disabled:opacity-50" aria-label="Toggle password">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="shine-button flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_45px_-12px_rgba(10,31,68,0.65)] transition hover:scale-[1.015] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
                  <Rocket size={17} />{loading ? "Creating..." : "Create account"}
                </button>
              </form>
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.1em] text-brand-500 bg-white px-2">
                  Or sign up with
                </div>
              </div>
              <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} disabled={loading} />
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-brand-800/60">
                <GraduationCap size={15} className="text-brand-600" /> Built for college students
              </div>
              <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-center text-sm text-brand-800/75">
                Already have an account?{" "}<Link to="/login" className="font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition hover:text-brand-800">Sign in</Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-800/45">
                <ShieldCheck size={13} /> Secure · Star-protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
