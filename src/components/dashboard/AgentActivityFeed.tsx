import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ActivityMsg } from "@/lib/app-store";
import { Check } from "lucide-react";

export function AgentActivityFeed({ messages }: { messages: ActivityMsg[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div
      ref={ref}
      className="h-72 overflow-y-auto rounded-xl border p-4 font-mono text-xs"
      style={{ background: "#080809", borderColor: "#2A2A2A" }}
    >
      {messages.length === 0 && (
        <div className="text-weak">// agents idle — run the simulation to begin</div>
      )}
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-2 leading-relaxed"
          >
            <span className="text-weak">[{m.ts}]</span>{" "}
            <span className="font-semibold text-primary">{m.agent}</span>{" "}
            <span className="text-foreground">{m.text}</span>
            {m.done && (
              <Check className="ml-1 inline h-3 w-3" style={{ color: "#3CFF7A" }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
