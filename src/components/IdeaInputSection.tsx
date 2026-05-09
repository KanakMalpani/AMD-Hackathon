import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AnimatedButton } from "./AnimatedButton";
import { LoadingSequence } from "./LoadingSequence";
import { useStartLaunch } from "@/lib/use-start-launch";

const CHIPS: { label: string; idea: string }[] = [
  { label: "Student SaaS", idea: "I want to build a SaaS that helps students create study plans and track progress." },
  { label: "AI Fitness Coach", idea: "I want to build an AI fitness coach that creates personalized workout and diet plans." },
  { label: "Creator Tool", idea: "I want to build a tool that helps creators plan, write, and schedule content." },
  { label: "Local Business App", idea: "I want to build an app that helps local businesses manage bookings and customers." },
];

export function IdeaInputSection() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const start = useStartLaunch();

  return (
    <section id="input" className="relative mx-auto mt-10 w-full max-w-[850px] px-4">
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 36px rgba(255,45,45,0.22)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        className="rounded-2xl border border-border p-6 sm:p-8"
        style={{ background: "#111111" }}
      >
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe your startup idea…"
            className="w-full resize-none rounded-xl border bg-background p-4 text-foreground placeholder:text-weak outline-none transition-colors"
            style={{
              minHeight: 140,
              borderColor: focused ? "rgba(255,45,45,0.65)" : "#2A2A2A",
            }}
          />
          {/* idea signal line */}
          <AnimatePresence>
            {value.length > 0 && (
              <motion.div
                key="signal"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-2 left-4 right-4 h-[2px] origin-left rounded-full"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 0 12px rgba(255,45,45,0.6)",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <motion.button
              key={c.label}
              whileHover={{ x: 4 }}
              onClick={() => setValue(c.idea)}
              className="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                background: "#181818",
                borderColor: "#2A2A2A",
                color: "#A1A1AA",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70 group-hover:shadow-[0_0_10px_rgba(255,45,45,0.6)]" />
              <span className="group-hover:text-foreground">{c.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-weak">
            {value.length > 0 ? `${value.length} chars · ready to launch` : "Add an idea or pick a chip"}
          </span>
          <AnimatedButton
            icon={<Sparkles className="h-4 w-4" />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => start(value), 350);
            }}
            disabled={loading || value.trim().length === 0}
            className={loading || value.trim().length === 0 ? "opacity-60" : ""}
          >
            Generate Launch Package
          </AnimatedButton>
        </div>

        <AnimatePresence>
          {loading && <LoadingSequence />}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
