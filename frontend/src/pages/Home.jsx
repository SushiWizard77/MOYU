import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FileText,
  Menu,
  Orbit,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Starfield from "../components/Starfield";

const MISSIONS = [
  { icon: Code2, title: "Coding Practice", description: "Practice DSA, SQL and programming with curated missions and arena.", accent: "from-brand-400 to-brand-700" },
  { icon: BookOpen, title: "Learning Roadmaps", description: "Follow glowing constellations for DSA, Web Dev, AI and Data.", accent: "from-sky-300 to-brand-600" },
  { icon: BriefcaseBusiness, title: "Company Prep", description: "Explore companies, eligibility, rounds and winning resources.", accent: "from-starlight to-brand-500" },
  { icon: Target, title: "Aptitude Galaxy", description: "Master aptitude, reasoning, communication and interview skills.", accent: "from-brand-300 to-brand-800" },
  { icon: FileText, title: "Resume Rocket", description: "Build your profile and launch a placement-ready resume.", accent: "from-indigo-300 to-brand-700" },
];
function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,#1d4fd7_0%,#0a1f44_48%,#030b1e_78%)]" />
      <div className="absolute inset-0 cosmic-grid opacity-60" />
      <Starfield density={180} />
      <div className="absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-brand-500/20 blur-[140px]" />
      <div className="absolute -right-40 top-2/3 h-[420px] w-[420px] rounded-full bg-nebula/15 blur-[130px]" />
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-brand-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Logo size={42} tagline="Placement Universe" />
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-semibold text-white">Home</Link>
            <Link to="/roadmaps" className="text-sm text-lavender-200 transition hover:text-starlight">Roadmaps</Link>
            <Link to="/companies" className="text-sm text-lavender-200 transition hover:text-starlight">Companies</Link>
            <Link to="/practice" className="text-sm text-lavender-200 transition hover:text-starlight">Practice</Link>
            <Link to="/resources" className="text-sm text-lavender-200 transition hover:text-starlight">Resources</Link>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10">Login</Link>
            <Link to="/register" className="shine-button rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold shadow-lg shadow-brand-500/40 transition hover:scale-[1.03]">Launch Free</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg border border-white/10 p-2 md:hidden" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-brand-950/95 px-6 py-5 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-white">Home</Link>
              <Link to="/roadmaps" onClick={() => setMobileMenuOpen(false)} className="text-lavender-200">Roadmaps</Link>
              <Link to="/companies" onClick={() => setMobileMenuOpen(false)} className="text-lavender-200">Companies</Link>
              <Link to="/practice" onClick={() => setMobileMenuOpen(false)} className="text-lavender-200">Practice</Link>
              <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className="text-lavender-200">Resources</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-white/15 py-3 text-center">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 py-3 text-center font-bold">Launch Free</Link>
            </div>
          </div>
        )}
      </header>
      <main className="relative z-10">
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-16 pt-36 lg:grid-cols-2 lg:pt-40">
          <div>
            <div className="animate-moyu-rise inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-brand-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              <Sparkles size={14} className="text-starlight" /> Mission control for placements
            </div>
            <h1 className="animate-moyu-rise-1 mt-6 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Your placement
              <span className="block">journey,</span>
              <span className="block bg-gradient-to-r from-starlight via-brand-200 to-brand-400 bg-clip-text text-transparent">written in stars.</span>
            </h1>
            <p className="animate-moyu-rise-2 mt-6 max-w-xl text-lg leading-8 text-lavender-200">
              MOYU turns coding, roadmaps, company prep and resumes into one cinematic mission.
            </p>
            <div className="animate-moyu-rise-3 mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="shine-button group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700 px-8 py-4 font-bold shadow-[0_20px_50px_-12px_rgba(47,107,255,0.8)] transition hover:scale-[1.03]">
                <Rocket size={19} /> Start your mission <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link to="/roadmaps" className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-lavender-100 backdrop-blur transition hover:bg-white/10">
                <Orbit size={19} className="text-brand-300" /> Explore roadmaps
              </Link>
            </div>
            <div className="animate-moyu-rise-3 mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[["12,400+", "Star cadets"], ["180+", "Companies"], ["92%", "Ready"]].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center backdrop-blur">
                  <p className="text-xl font-black text-starlight">{v}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-lavender-300">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-r from-brand-500/25 via-nebula/15 to-brand-700/25 blur-2xl" />
            <div className="animate-moyu-float-slow relative overflow-hidden rounded-[28px] border border-white/10 bg-brand-900/80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-starlight" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-3 flex h-8 flex-1 items-center gap-2 rounded-lg bg-brand-950/70 px-3 text-xs text-brand-200">
                  <Star size={12} className="text-starlight" /> moyu.space/dashboard
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="flex items-center gap-2 text-xs text-brand-200"><Zap size={13} className="text-starlight" /> Welcome back, future star</p>
                <h3 className="mt-1 text-xl font-black">Ready for launch?</h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <Code2 className="text-brand-300" size={20} />
                    <p className="mt-3 text-xs text-lavender-300">DSA Progress</p>
                    <p className="mt-1 text-xl font-black text-white">72%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <Target className="text-starlight" size={20} />
                    <p className="mt-3 text-xs text-lavender-300">Aptitude</p>
                    <p className="mt-1 text-xl font-black text-white">54%</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-600/25 to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Placement Readiness</p>
                    <p className="text-sm font-black text-starlight">78%</p>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-starlight via-brand-300 to-brand-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(47,107,255,0.10),transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20">
            <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-brand-600">Choose your constellation</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black text-brand-800 sm:text-4xl">One universe. Every placement power.</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {MISSIONS.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className="group rounded-3xl border border-brand-100 bg-white p-6 shadow-[0_18px_45px_-24px_rgba(10,31,68,0.35)] transition hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_28px_60px_-20px_rgba(47,107,255,0.45)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-500/30 transition group-hover:scale-110"><Icon size={22} /></div>
                    <h3 className="mt-5 font-bold text-brand-800">{m.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-brand-800/65">{m.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="bg-white px-6 pb-20 pt-2">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-center shadow-[0_30px_90px_-20px_rgba(10,31,68,0.65)] sm:p-16">
            <div className="pointer-events-none absolute inset-0 opacity-50"><Starfield density={60} shootingStars={false} /></div>
            <div className="relative">
              <TrendingUp className="mx-auto text-starlight" size={38} />
              <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">Your story starts tonight.</h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-brand-100">MOYU maps your stars and tells you the exact next mission.</p>
              <Link to="/register" className="shine-button mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-black text-brand-800 shadow-xl transition hover:scale-[1.03]">Start your journey — free</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t border-brand-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4"><Logo size={40} dark /><p className="text-sm font-medium text-brand-800/70">Learn. Practice. Get Placed.</p></div>
          <p className="text-sm font-medium text-brand-800/60">© 2026 MOYU · Reach for the stars.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;



