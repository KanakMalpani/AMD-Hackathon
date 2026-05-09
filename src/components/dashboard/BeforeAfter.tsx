import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export function BeforeAfter({ idea, ready }: { idea: string; ready: boolean }) {
  const checks = [
    "Problem validated",
    "MVP scoped",
    "Launch copy generated",
    "Revenue estimated",
    "Critic reviewed",
  ];
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div
          className="rounded-xl border p-4"
          style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-weak">Raw idea</div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-5">
            {idea || "Just an unstructured thought waiting to become something real…"}
          </p>
          <Sparkles className="mt-3 h-4 w-4 text-primary" />
        </div>

        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7 }}
            className="hidden h-px w-24 origin-left md:block"
            style={{ background: "linear-gradient(90deg,#FF2D2D,#3CFF7A)" }}
          />
          <ArrowRight className="md:hidden h-5 w-5 text-primary" />
        </div>

        <div
          className="rounded-xl border p-4"
          style={{
            background: "#0c0c0e",
            borderColor: ready ? "rgba(60,255,122,0.4)" : "#2A2A2A",
            boxShadow: ready ? "0 0 22px rgba(60,255,122,0.18)" : undefined,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-weak">Launch package</div>
          <ul className="mt-2 space-y-1.5">
            {checks.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: ready ? 1 : 0.35, x: 0 }}
                transition={{ delay: ready ? i * 0.12 : 0, duration: 0.4 }}
                className="flex items-center gap-2 text-sm"
              >
                <Check className="h-3.5 w-3.5" style={{ color: ready ? "#3CFF7A" : "#5C5C63" }} />
                <span className={ready ? "text-foreground" : "text-muted-foreground"}>{c}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
