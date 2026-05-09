import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Map,
  Hammer,
  Megaphone,
  LineChart,
  Sparkles,
} from "lucide-react";

const blocks = [
  { label: "Validate", Icon: ShieldCheck },
  { label: "Plan", Icon: Map },
  { label: "Build", Icon: Hammer },
  { label: "Market", Icon: Megaphone },
  { label: "Simulate", Icon: LineChart },
  { label: "Review", Icon: Sparkles },
];

export function IdeaCoreVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % blocks.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 6, y: px * 8 });
  };

  const radius = 170;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto aspect-square w-full max-w-[520px]"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Static rings (subtle, non-rotating to reduce glitch) */}
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: "rgba(255,45,45,0.18)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
          style={{ borderColor: "rgba(255,45,45,0.10)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: "rgba(60,255,122,0.06)" }}
        />

        {/* Idea Core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="relative grid h-36 w-36 place-items-center rounded-full"
            style={{
              background: "#FF2D2D",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 0 40px rgba(255,45,45,0.35)",
            }}
          >
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">Your</div>
              <div className="font-display text-lg font-bold text-white">Idea</div>
            </div>
          </div>
        </div>

        {/* Connector lines: only the active line is green */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 520" fill="none">
          {blocks.map((_, i) => {
            const a = (i / blocks.length) * Math.PI * 2 - Math.PI / 2;
            const innerR = 78;
            const x1 = 260 + Math.cos(a) * innerR;
            const y1 = 260 + Math.sin(a) * innerR;
            const cx = 260 + Math.cos(a) * radius;
            const cy = 260 + Math.sin(a) * radius;
            const isActive = activeIdx === i;
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={cx}
                y2={cy}
                initial={false}
                animate={{
                  stroke: isActive ? "rgba(60,255,122,0.85)" : "rgba(255,255,255,0.06)",
                  strokeWidth: isActive ? 1.5 : 1,
                  opacity: isActive ? 1 : 0.7,
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </svg>

        {/* Output blocks */}
        {blocks.map(({ label, Icon }, i) => {
          const a = (i / blocks.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * radius;
          const y = Math.sin(a) * radius;
          const isActive = activeIdx === i;
          return (
            <div
              key={label}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{
                  background: "rgba(14,14,16,0.9)",
                  borderColor: isActive ? "rgba(60,255,122,0.7)" : "#1F1F22",
                  boxShadow: isActive ? "0 0 18px rgba(60,255,122,0.25)" : "none",
                  transition: "border-color 0.5s ease, box-shadow 0.5s ease",
                }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{
                    color: isActive ? "#3CFF7A" : "#8A8A93",
                    transition: "color 0.5s ease",
                  }}
                />
                <span className="text-xs font-medium" style={{ color: isActive ? "#D8D8DC" : "#8A8A93" }}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
