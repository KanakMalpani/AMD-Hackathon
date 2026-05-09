import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { CountUpMetric, CountUpBar } from "./CountUpMetric";
import { RevealSection } from "./RevealSection";

const metrics = [
  { label: "Launch Readiness Score", value: 87, suffix: "%", pct: 87, green: true },
  { label: "Tasks Completed", value: 24, suffix: "", pct: 80 },
  { label: "Revenue Projection", value: 800, suffix: "/mo", prefix: "$", pct: 65 },
  { label: "Idea-to-Launch Timeline", value: 48, suffix: "h", pct: 90 },
];

export function GrowthSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <RevealSection>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#3CFF7A]">Growth</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Watch your idea grow</h2>
          <p className="mt-3 text-muted-foreground">
            From a fragile spark to a structured, critic-reviewed launch package — in one continuous flow.
          </p>
        </div>
      </RevealSection>

      <div ref={ref} className="mt-14 grid gap-10 lg:grid-cols-2">
        {/* Before / After */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Raw Idea */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border p-5"
            style={{ background: "#0e0e0e" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary/70" />
              <span className="text-xs uppercase tracking-wider text-weak">Raw Idea</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-3/4 rounded bg-[#1a1a1a]" />
              <div className="h-2 w-full rounded bg-[#1a1a1a]" />
              <div className="h-2 w-2/3 rounded bg-[#1a1a1a]" />
              <div className="h-2 w-5/6 rounded bg-[#1a1a1a]" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-weak">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> unstructured · unverified
            </div>
          </motion.div>

          <div className="relative h-px w-16 sm:w-20">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="h-px w-full origin-left"
              style={{ background: "#3CFF7A" }}
            />
            <ArrowRight className="absolute -right-2 -top-2 h-4 w-4 text-[#3CFF7A]" />
          </div>

          {/* Launch Package */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="rounded-2xl border p-5"
            style={{
              background: "#0d130f",
              borderColor: "rgba(60,255,122,0.35)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#3CFF7A]">Launch Package</span>
              <span className="rounded-full border border-[rgba(60,255,122,0.45)] bg-[rgba(60,255,122,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#3CFF7A]">
                READY
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {["Problem validated", "MVP scope defined", "Marketing plan", "Revenue model"].map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="flex items-center gap-2 text-foreground"
                >
                  <Check className="h-4 w-4 text-[#3CFF7A]" />
                  {t}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border p-5"
              style={{ background: "#111111" }}
            >
              <div className="text-xs uppercase tracking-wider text-weak">{m.label}</div>
              <div className={`mt-2 font-display text-3xl font-bold ${m.green ? "text-[#3CFF7A]" : "text-foreground"}`}>
                <CountUpMetric value={m.value} suffix={m.suffix} prefix={m.prefix} />
              </div>
              <div className="mt-4">
                <CountUpBar pct={m.pct} green={m.green} delay={0.4 + i * 0.1} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
