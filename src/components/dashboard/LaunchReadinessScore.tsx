import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LaunchReadinessScore({
  score,
  breakdown,
}: {
  score: number;
  breakdown: { problem: number; market: number; mvp: number; differentiation: number; revenue: number; execution: number };
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = display;
    const to = score;
    const dur = 900;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setDisplay(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;
  const ready = display >= 80;

  const bars = [
    { label: "Problem clarity", v: breakdown.problem },
    { label: "Market demand", v: breakdown.market },
    { label: "MVP feasibility", v: breakdown.mvp },
    { label: "Differentiation", v: breakdown.differentiation },
    { label: "Revenue logic", v: breakdown.revenue },
    { label: "Execution readiness", v: breakdown.execution },
  ];

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-weak">Launch readiness</div>
          <div className="mt-1 font-display text-lg font-semibold">
            {ready ? "Launch ready" : "In progress"}
          </div>
        </div>
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="readinessGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF2D2D" />
                <stop offset="100%" stopColor="#3CFF7A" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r={r} stroke="#1f1f22" strokeWidth="10" fill="none" />
            <motion.circle
              cx="80"
              cy="80"
              r={r}
              stroke="url(#readinessGrad)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={ready ? { filter: "drop-shadow(0 0 8px rgba(60,255,122,0.55))" } : undefined}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div
                className="font-display text-3xl font-bold"
                style={{ color: ready ? "#3CFF7A" : "#F8F8F8" }}
              >
                {display}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-weak">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {bars.map((b, i) => (
          <div key={b.label}>
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{b.label}</span>
              <span className="text-foreground">{b.v}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#1a1a1c]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score === 0 ? 0 : b.v}%` }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#FF2D2D,#3CFF7A)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
