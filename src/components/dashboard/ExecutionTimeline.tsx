import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { Stage } from "@/lib/app-store";

export function ExecutionTimeline({ stages }: { stages: Stage[] }) {
  return (
    <ol className="relative space-y-3 pl-2">
      {stages.map((s, i) => {
        const dotColor =
          s.status === "complete" ? "#3CFF7A" : s.status === "running" ? "#FF2D2D" : "#2A2A2A";
        return (
          <li key={s.key} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <motion.span
                className="grid h-6 w-6 place-items-center rounded-full"
                style={{ background: dotColor + "22", border: `1px solid ${dotColor}` }}
                animate={
                  s.status === "running"
                    ? { boxShadow: ["0 0 0px rgba(255,45,45,0.0)", "0 0 18px rgba(255,45,45,0.65)", "0 0 0 rgba(255,45,45,0)"] }
                    : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
                transition={{ duration: 1.4, repeat: s.status === "running" ? Infinity : 0 }}
              >
                {s.status === "complete" ? (
                  <Check className="h-3.5 w-3.5" style={{ color: "#3CFF7A" }} />
                ) : s.status === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#FF2D2D" }} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#5C5C63" }} />
                )}
              </motion.span>
              {i < stages.length - 1 && (
                <span
                  className="mt-1 w-px flex-1"
                  style={{
                    background:
                      s.status === "complete"
                        ? "linear-gradient(180deg,#3CFF7A,#2A2A2A)"
                        : "#2A2A2A",
                    minHeight: 24,
                  }}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "text-sm font-medium " +
                    (s.status === "pending" ? "text-muted-foreground" : "text-foreground")
                  }
                >
                  {s.title}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                  style={{
                    color: dotColor,
                    border: `1px solid ${dotColor}`,
                    background: dotColor + "12",
                  }}
                >
                  {s.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-weak">{s.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
