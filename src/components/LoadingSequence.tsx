import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Capturing idea...",
  "Mapping opportunity...",
  "Validating market...",
  "Building startup world...",
  "Running critic review...",
  "Calculating readiness...",
];

export function LoadingSequence({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step >= STEPS.length) {
      setDone(true);
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 750 + Math.random() * 200);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  const progress = Math.min(100, (step / STEPS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl border border-border p-6"
      style={{
        background: "rgba(17,17,17,0.8)",
        boxShadow: "0 0 36px rgba(255,45,45,0.18)",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          {done ? "Startup world ready" : "Building your startup world..."}
        </h3>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#181818]">
        <motion.div
          className="h-full"
          style={{ background: done ? "#6FE3A1" : "#C2473D" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li
              key={label}
              className="flex items-center gap-3 rounded-lg border border-border bg-[#0d0d0d] px-3 py-2"
            >
              {state === "done" && (
                <span
                  className="grid h-5 w-5 place-items-center rounded-full"
                  style={{ background: "rgba(60,255,122,0.18)" }}
                >
                  <Check className="h-3 w-3 text-[#3CFF7A]" />
                </span>
              )}
              {state === "active" && (
                <span className="pulse-red grid h-5 w-5 place-items-center rounded-full bg-primary/20">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </span>
              )}
              {state === "pending" && <span className="h-5 w-5 rounded-full border border-border" />}
              <span
                className={`text-sm ${
                  state === "done" ? "text-foreground" : state === "active" ? "text-foreground" : "text-weak"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {!done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 grid gap-3 sm:grid-cols-3"
          >
            {["Validation", "Agent Cast", "Revenue"].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-border p-4"
                style={{ background: "#0e0e0e" }}
              >
                <div className="mb-3 text-xs uppercase tracking-wider text-weak">{t}</div>
                <div className="shimmer mb-2 h-3 w-3/4 rounded" />
                <div className="shimmer mb-2 h-3 w-full rounded" />
                <div className="shimmer h-3 w-1/2 rounded" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border p-5"
            style={{
              background: "#0d130f",
              borderColor: "rgba(60,255,122,0.4)",
              boxShadow: "0 0 28px rgba(60,255,122,0.20)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-weak">
                  Launch Readiness Score
                </div>
                <div className="font-display text-3xl font-bold text-[#3CFF7A]">87%</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(60,255,122,0.35)] bg-[rgba(60,255,122,0.08)] px-3 py-1 text-xs text-[#3CFF7A]">
                <span className="pulse-green h-1.5 w-1.5 rounded-full bg-[#3CFF7A]" />
                Startup world generated
              </span>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              {["Problem validated", "Agent cast created", "Revenue model estimated"].map(
                (b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#3CFF7A]" />
                    {b}
                  </li>
                ),
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
