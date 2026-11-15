import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Blocks,
  BrainCircuit,
  Building2,
  Coins,
  History,
  LayoutDashboard,
  Menu,
  ShieldAlert,
  X,
} from "lucide-react";
import { healthService } from "../api/services";
import { motion } from "framer-motion";

const NAV = [
  { to: "/", label: "Executive Dashboard", short: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/valuation", label: "Property Valuation", short: "Valuation", icon: Building2 },
  { to: "/explainability", label: "AI Explainability", short: "Explainability", icon: BrainCircuit },
  { to: "/risk", label: "Risk Assessment", short: "Risk", icon: ShieldAlert },
  { to: "/tokenisation", label: "Tokenisation", short: "Tokenisation", icon: Coins },
  { to: "/models", label: "Model Performance", short: "Models", icon: BarChart3 },
  { to: "/blockchain", label: "Blockchain Explorer", short: "Explorer", icon: Blocks },
  { to: "/history", label: "Prediction History", short: "History", icon: History },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [modelOk, setModelOk] = useState<boolean | null>(null);
  const location = useLocation();
  const clock = useClock();

  useEffect(() => {
    let alive = true;
    const check = () =>
      healthService
        .get()
        .then((h) => {
          if (!alive) return;
          setApiUp(true);
          setModelOk(h.model_loaded);
        })
        .catch(() => {
          if (!alive) return;
          setApiUp(false);
          setModelOk(null);
        });
    check();
    const t = setInterval(check, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const live = apiUp && modelOk;
  const status = {
    dot:
      apiUp == null
        ? "bg-slate-500"
        : live
          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]"
          : "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]",
    text:
      apiUp == null
        ? "Checking API…"
        : apiUp
          ? modelOk
            ? "Live · model loaded"
            : "API up · model unavailable"
          : "API unreachable",
  };

  const current =
    NAV.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
    ) ?? NAV[0];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_8px_24px_rgba(139,92,246,0.45)] ring-1 ring-white/25 transition-transform duration-300 hover:scale-105 hover:-rotate-6">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-display text-[16px] font-semibold leading-none tracking-tight text-white">
            PropVal <span className="text-gradient">AI</span>
          </p>
          <p className="mt-1.5 text-xs leading-none text-slate-400">
            Value · Risk · Tokenise
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-200 ${
                isActive
                  ? "font-medium text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl border border-indigo-300/25 bg-gradient-to-r from-indigo-500/[0.22] via-violet-500/[0.14] to-transparent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                    <motion.span
                      layoutId="nav-bar"
                      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 via-violet-400 to-fuchsia-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  </>
                )}
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-all duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6 ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_16px_rgba(129,140,248,0.55)] ring-white/25"
                      : "bg-white/[0.04] text-slate-400 ring-white/[0.07] group-hover:bg-indigo-400/15 group-hover:text-indigo-200 group-hover:ring-indigo-300/30"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            {live && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
          </span>
          {status.text}
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
          Academic prototype. Valuations are model estimates, not certified
          appraisals; tokens are not legal proof of ownership.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      {/* Fixed backdrop: accent glows + faint grid (CSS-only) */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="bg-glows absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.06] bg-ink-900/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/[0.08] bg-ink-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:border-indigo-300/40 hover:text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="font-display text-sm font-semibold tracking-tight text-slate-100">
              {current.short}
            </span>
            <div className="ml-auto flex items-center gap-4">
              <span
                className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex ${
                  live
                    ? "border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-200"
                    : "border-white/10 bg-white/[0.03] text-slate-300"
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {live && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  )}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${status.dot}`} />
                </span>
                {status.text}
              </span>
              <span className="num hidden text-[13px] text-slate-400 md:block">
                {clock} <span className="text-xs text-slate-500">IST</span>
              </span>
            </div>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 14, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
