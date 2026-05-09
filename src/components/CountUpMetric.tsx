import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUpMetric({
  value,
  suffix = "",
  prefix = "",
  duration = 1.4,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      const next = value * eased;
      last = Math.max(last, next);
      setN(last);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString()}
      {suffix}
    </span>
  );
}

export function CountUpBar({
  pct,
  green,
  delay = 0,
}: {
  pct: number;
  green?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setWidth(pct), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, pct, delay]);

  return (
    <div ref={ref} className="h-1.5 w-full overflow-hidden rounded-full bg-[#181818]">
      <div
        className="h-full"
        style={{
          width: `${width}%`,
          background: green ? "#3CFF7A" : "#FF2D2D",
          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
