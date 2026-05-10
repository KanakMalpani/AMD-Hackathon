import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { IdeaCoreVisual } from "./IdeaCoreVisual";
import { useStartLaunch } from "@/lib/use-start-launch";

const TYPE_TARGET = "Simulate the company";
const TYPE_START_DELAY = 800;

function Typewriter({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(id);
      }, 70);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, startDelay]);
  const done = count >= text.length;
  return (
    <span className="text-highlight">
      {text.slice(0, count)}
      <span
        aria-hidden
        className={"ml-0.5 inline-block h-[0.9em] w-[3px] -mb-1 bg-primary align-baseline " + (done ? "animate-pulse" : "")}
      />
    </span>
  );
}

export function HeroSection() {
  const start = useStartLaunch();
  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pt-40">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mr-3 inline-block"
            >
              Stop pitching static startup plans.
            </motion.span>
            <span className="mr-3 inline-block">
              <Typewriter text={TYPE_TARGET} startDelay={TYPE_START_DELAY} />
            </span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: TYPE_START_DELAY / 1000 + TYPE_TARGET.length * 0.07 + 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mr-3 inline-block"
            >
              in motion.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 max-w-[640px] text-base text-muted-foreground sm:text-lg"
          >
            LaunchMyIdea AI transforms a raw idea into an AMD-powered startup world:
            strategy, agent cast, MVP build plan, launch narrative, revenue logic, and a
            critic-reviewed simulation report you can inspect live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <AnimatedButton icon={<Rocket className="h-4 w-4" />} onClick={() => start()}>
              Enter the startup world
            </AnimatedButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <IdeaCoreVisual />
        </motion.div>
      </div>
    </section>
  );
}
