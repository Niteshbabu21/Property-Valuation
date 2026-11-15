import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, type Variants } from "framer-motion";

/** v4 motion language: premium dark UI movement — soft springs for
 * entrances, a shared ease-out curve for tweens, everything inside a
 * 150–900ms envelope. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

/** Stagger container: children wrapped in <Item> spring in one after
 * another (60ms apart). */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export function Stagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/** Spring entrance on mount. `delay` staggers sections within a page. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 30, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Eases a number from its previous value to `value` (max 900ms,
 * ease-out) and renders it through `format`. Pure presentation — the
 * value itself always comes from the API. */
export function CountUp({
  value,
  format,
  duration = 0.9,
  className = "",
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: Math.min(duration, 0.9),
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);
  return <span className={className}>{format(display)}</span>;
}

/** Horizontal bar that springs to `pct`% width with a soft glow at its
 * tip — used for risk factors, domain scores and fractional bars. */
export function SpringBar({
  pct,
  className = "",
  delay = 0,
}: {
  pct: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`bar-glow h-full rounded-full ${className}`}
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      transition={{ type: "spring", stiffness: 90, damping: 24, delay }}
    />
  );
}
