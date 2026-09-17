import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Mail, Sparkles, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import Starfield from "../components/Starfield";
import Button from "../components/ui/Button";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [devResetLink, setDevResetLink] = useState("");
  const { forgotPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        setSent(true);
        setDevResetLink(res.devResetLink || "");
      } else setError(res.message || "Something went wrong.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
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
          <Link to="/login" className="animate-moyu-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-brand-200 backdrop-blur transition hover:bg-white/10">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
          <div className="animate-moyu-rise-1 mt-8">
            <Logo size={54} tagline="Placement Universe" />
          </div>
          <h1 className="animate-moyu-rise-2 mt-8 max-w-md text-5xl font-black leading-[1.05] tracking-tight">
            Lost your launch key?
            <span className="block bg-gradient-to-r from-starlight via-brand-200 to-brand-400 bg-clip-text text-transparent">
              we can help.
            </span>
          </h1>
          <p className="animate-moyu-rise-3 mt-5 max-w-md leading-7 text-lavender-300">
            Enter the email tied to your account. If it exists, a reset link will be sent your way.
          </p>
        </div>

        <div className="w-full">
          <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-lavender-300 transition hover:text-white lg:hidden">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
          <div className="animate-moyu-rise relative overflow-hidden rounded-[28px] border border-white/40 bg-white p-7 text-brand-800 shadow-[0_30px_80px_-20px_rgba(3,11,30,0.55)] sm:p-9">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-200/50 blur-[70px]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="lg:hidden"><Logo size={40} dark /></div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700">
                  <Sparkles size={12} /> Account recovery
                </span>
              </div>

              {sent ? (
                <div className="mt-7 space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
                    <Sparkles size={20} className="mx-auto mb-2 text-emerald-600" />
                    <p className="font-semibold">Reset link sent</p>
                    <p className="mt-1 text-emerald-700/70">
                      If an account exists for{" "}
                      <span className="font-semibold">{email}</span>, you will receive a reset link shortly.
                    </p>
                  </div>
                  {devResetLink && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
                      <p className="font-semibold">Development reset link</p>
                      <p className="mt-1 text-amber-800/80">Email delivery is not configured in this environment. Use this link to finish recovery:</p>
                      <a href={devResetLink} className="mt-2 block break-all font-bold text-amber-950 underline">{devResetLink}</a>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-800">College Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@college.edu"
                        required
                        disabled={loading}
                        className="w-full rounded-2xl border border-brand-100 bg-brand-50/60 py-4 pl-11 pr-4 text-sm font-medium text-brand-800 outline-none transition placeholder:text-brand-800/35 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                  {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  <Button type="submit" loading={loading} className="w-full">
                    Send reset link
                  </Button>
                  <p className="text-center text-xs text-brand-800/60">
                    This link expires quickly. Check your inbox (and spam folder).
                  </p>
                </form>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-brand-800/60">
                <Sparkles size={15} className="text-emerald-600" /> Secure password recovery
              </div>
              <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-center text-sm text-brand-800/75">
                Remember your password?{" "}
                <Link to="/login" className="font-bold text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition hover:text-brand-800">
                  Sign in
                </Link>
              </div>
              <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-800/45">MOYU · Learn. Practice. Get Placed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;