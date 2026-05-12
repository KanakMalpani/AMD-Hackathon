import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { CountUpMetric } from "./CountUpMetric";
import { RevealSection } from "./RevealSection";

const TIMELINE = [
  { label: "Captured", state: "done" },
  { label: "Validated", state: "done" },
  { label: "Generated", state: "done" },
  { label: "Reviewed", state: "active" },
  { label: "Launch Ready", state: "pending" },
];

export function DemoPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="demo" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <RevealSection>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Preview</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Preview the launch flow</h2>
          <p className="mt-3 text-muted-foreground">A glimpse of what gets generated when an idea enters the system.</p>
        </div>
      </RevealSection>

      <motion.div
        ref={ref}
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-12 max-w-6xl rounded-3xl border border-border p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,20,0.8), rgba(10,10,10,0.8))",
          backdropFilter: "blur(14px)",
          boxShadow: "0 40px 120px -40px rgba(255,45,45,0.25)",
        }}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input */}
          <div className="rounded-2xl border border-border p-5" style={{ background: "#0d0d0d" }}>
            <div className="text-xs uppercase tracking-wider text-weak">Input</div>
            <div className="mt-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              "I want to build a SaaS that helps students create study plans and track progress."
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-weak">
              <span className="rounded-full border border-border bg-[#181818] px-2 py-0.5">Student SaaS</span>
              <span className="rounded-full border border-border bg-[#181818] px-2 py-0.5">EdTech</span>
              <span className="rounded-full border border-border bg-[#181818] px-2 py-0.5">B2C</span>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl border border-border p-5" style={{ background: "#0d0d0d" }}>
            <div className="text-xs uppercase tracking-wider text-weak">Progress</div>
            <ol className="mt-4 space-y-3">
              {TIMELINE.map((s, i) => (
                <motion.li
                  key={s.label}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.18 }}
                  className="flex items-center gap-3"
                >
                  {s.state === "done" && (
                    <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: "rgba(60,255,122,0.15)" }}>
                      <Check className="h-3.5 w-3.5 text-[#3CFF7A]" />
                    </span>
                  )}
                  {s.state === "active" && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 pulse-red">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    </span>
                  )}
                  {s.state === "pending" && <span className="h-6 w-6 rounded-full border border-border" />}
                  <span
                    className={`text-sm ${
                      s.state === "pending" ? "text-weak" : "text-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-border p-5" style={{ background: "#0d0d0d" }}>
            <div className="text-xs uppercase tracking-wider text-weak">Output Summary</div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Market", "Strong niche"],
                ["MVP", "5 core features"],
                ["Revenue", "Subscription model"],
              ].map(([k, v], i) => (
                <motion.li
                  key={k}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-[#0a0a0a] px-3 py-2"
                >
                  <span className="text-weak">{k}</span>
                  <span className="text-foreground">{v}</span>
                </motion.li>
              ))}
              <motion.li
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="mt-2 flex items-center justify-between rounded-lg border px-3 py-3"
                style={{
                  borderColor: "rgba(60,255,122,0.4)",
                  background: "rgba(60,255,122,0.06)",
                }}
              >
                <span className="text-xs uppercase tracking-wider text-[#3CFF7A]">Score</span>
                <span className="font-display text-2xl font-bold text-[#3CFF7A]">
                  <CountUpMetric value={87} suffix="%" />
                </span>
              </motion.li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
