import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, Sparkles } from "lucide-react";
import { CountUp } from "./motion";

/* v4 shared kit — dark glass surfaces, gradient icon tiles, glowing
 * semantic badges. Presentation only; data flows are unchanged. */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_10px_36px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-indigo-400/30 hover:shadow-[0_16px_44px_rgba(99,102,241,0.16)] ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
      <div>
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-100">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

const TONE_TILES = {
  indigo:
    "from-indigo-500/35 to-indigo-500/10 text-indigo-300 ring-indigo-400/30 shadow-[0_0_18px_rgba(99,102,241,0.35)]",
  violet:
    "from-violet-500/35 to-violet-500/10 text-violet-300 ring-violet-400/30 shadow-[0_0_18px_rgba(168,85,247,0.32)]",
  cyan:
    "from-cyan-400/30 to-cyan-400/10 text-cyan-300 ring-cyan-300/30 shadow-[0_0_18px_rgba(34,211,238,0.3)]",
  emerald:
    "from-emerald-400/30 to-emerald-400/10 text-emerald-300 ring-emerald-300/30 shadow-[0_0_18px_rgba(52,211,153,0.3)]",
  amber:
    "from-amber-400/30 to-amber-400/10 text-amber-300 ring-amber-300/30 shadow-[0_0_18px_rgba(251,191,36,0.28)]",
  rose:
    "from-rose-500/35 to-rose-500/10 text-rose-300 ring-rose-400/30 shadow-[0_0_18px_rgba(244,63,94,0.32)]",
} as const;

export type IconTone = keyof typeof TONE_TILES;

/** Gradient-tinted icon tile with an interactive hover (scale + tilt +
 * brighter glow). Used across nav, stats and section headers. */
export function IconTile({
  children,
  tone = "indigo",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  tone?: IconTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "sm"
      ? "h-7 w-7 rounded-lg"
      : size === "lg"
        ? "h-11 w-11 rounded-xl"
        : "h-9 w-9 rounded-[10px]";
  return (
    <span
      className={`group/tile inline-flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 transition-all duration-200 ease-out hover:scale-110 hover:-rotate-6 hover:brightness-150 ${dims} ${TONE_TILES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "indigo",
  countTo,
  formatCount,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: IconTone;
  /** When set, the value eases up to this number through formatCount. */
  countTo?: number;
  formatCount?: (n: number) => string;
}) {
  return (
    <Card className="sheen group px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-400">{label}</p>
        {icon && (
          <IconTile tone={tone} size="sm">
            {icon}
          </IconTile>
        )}
      </div>
      <p className="num mt-2.5 font-display text-[27px] font-semibold leading-none tracking-tight text-slate-50">
        {countTo != null && formatCount ? (
          <CountUp value={countTo} format={formatCount} />
        ) : (
          value
        )}
      </p>
      {hint && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </Card>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-md ${className}`} aria-hidden />;
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="px-5 py-4">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/[0.08] px-6 py-10 text-center">
      <IconTile tone="rose" size="lg">
        <AlertTriangle className="h-5 w-5" />
      </IconTile>
      <p className="max-w-md text-sm leading-relaxed text-rose-200">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-rose-300/25 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:border-rose-300/50 hover:bg-rose-400/10"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <IconTile tone="indigo" size="lg">
        <Inbox className="h-5 w-5" />
      </IconTile>
      <p className="mt-1 text-sm font-medium text-slate-200">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}

export function RiskBadge({ category }: { category: "LOW" | "MEDIUM" | "HIGH" }) {
  const styles = {
    LOW: "border-emerald-300/30 bg-emerald-400/10 text-emerald-300",
    MEDIUM: "border-amber-300/30 bg-amber-400/10 text-amber-300",
    HIGH: "border-rose-300/30 bg-rose-400/10 text-rose-300",
  } as const;
  const dots = {
    LOW: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
    MEDIUM: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]",
    HIGH: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[category]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[category]}`} />
      {category}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-7">
      <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-400/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300">
        <Sparkles className="h-3 w-3" />
        {eyebrow ?? "PropVal AI"}
      </p>
      <h1 className="mt-3.5 font-display text-[30px] font-semibold leading-tight tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}

/** Primary gradient button classes (shared by pages that render their
 * own <button>/<Link> so the treatment stays consistent). */
export const btnPrimary =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-medium text-white shadow-[0_10px_28px_rgba(99,102,241,0.38)] transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";
export const btnGhost =
  "rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 transition hover:border-indigo-300/40 hover:bg-indigo-400/[0.08] hover:text-white active:scale-[0.98] disabled:opacity-40";
export const inputDark =
  "rounded-xl border border-white/10 bg-white/[0.04] text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/25 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]";
export const tooltipBox = {
  background: "rgba(9, 13, 24, 0.94)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
  boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
  backdropFilter: "blur(8px)",
} as const;
export const chartGrid = "rgba(148,163,184,0.13)";
export const chartTick = { fill: "#8b98b8", fontSize: 11 } as const;
