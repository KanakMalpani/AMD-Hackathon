import { motion } from "framer-motion";
import { useRef, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export function FeatureCard({
  Icon,
  title,
  description,
  green,
  delay = 0,
}: {
  Icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  green?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 4, y: px * 6 });
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      }}
      whileHover={{ y: -6 }}
      style={{
        background: "#111111",
        borderColor: hover ? "rgba(255,45,45,0.5)" : "#2A2A2A",
        boxShadow: hover ? "0 18px 50px -12px rgba(255,45,45,0.35)" : "none",
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className="rounded-2xl border p-6 transition-colors"
    >
      <motion.div
        animate={{ y: hover ? -3 : 0 }}
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border`}
        style={{
          background: green ? "rgba(60,255,122,0.08)" : "rgba(255,45,45,0.08)",
          borderColor: green ? "rgba(60,255,122,0.35)" : "rgba(255,45,45,0.35)",
        }}
      >
        <Icon className={`h-5 w-5 ${green ? "text-[#3CFF7A]" : "text-primary"}`} />
      </motion.div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
