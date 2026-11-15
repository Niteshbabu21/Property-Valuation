import { motion } from "framer-motion";
import { CountUp } from "./motion";

/** Semicircular gauge for a 0–100 risk score. The arc springs to the
 * score with a band-coloured glow and tick marks at the band edges —
 * pure presentation of whatever the risk API returned. */
export default function RiskGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped < 30 ? "#34d399" : clamped < 60 ? "#fbbf24" : "#fb7185";

  // Tick dots on the track at the band boundaries (0 / 30 / 60 / 100).
  const ticks = [0, 30, 60, 100].map((v) => {
    const theta = Math.PI - (v / 100) * Math.PI;
    return {
      v,
      x: 100 + 78 * Math.cos(theta),
      y: 100 - 78 * Math.sin(theta),
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[280px]">
        <svg viewBox="0 0 200 112" className="w-full">
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <motion.path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke={color}
            strokeWidth="13"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 7px ${color})` }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: clamped / 100 }}
            transition={{ type: "spring", stiffness: 55, damping: 20 }}
          />
          {ticks.map((t) => (
            <circle key={t.v} cx={t.x} cy={t.y} r="2.2" fill="#5b6b8c" />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <p className="num font-display text-[36px] font-semibold leading-none text-white">
            <CountUp value={clamped} format={(v) => v.toFixed(1)} />
          </p>
          <p className="mt-1.5 text-xs text-slate-400">Out of 100</p>
        </div>
      </div>
      <div className="mt-3 flex w-full max-w-[280px] justify-between text-[11px] font-medium">
        <span className="text-emerald-300">Low 0–29</span>
        <span className="text-amber-300">Medium 30–59</span>
        <span className="text-rose-300">High 60–100</span>
      </div>
    </div>
  );
}
