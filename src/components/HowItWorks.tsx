import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, ShieldCheck, Package, Gauge } from "lucide-react";
import { RevealSection } from "./RevealSection";

const steps = [
  {
    n: "01",
    Icon: Brain,
    title: "Capture the idea",
    desc: "Understands your concept, audience, and core problem.",
  },
  {
    n: "02",
    Icon: ShieldCheck,
    title: "Validate the opportunity",
    desc: "Checks market clarity, pain intensity, competitors, risks, and differentiation.",
  },
  {
    n: "03",
    Icon: Package,
    title: "Simulate the company",
    desc: "Builds the product plan, agent cast, launch motion, code direction, and revenue logic.",
  },
  {
    n: "04",
    Icon: Gauge,
    title: "Critique and iterate",
    desc: "Stress-tests assumptions, exposes failure modes, and returns a readiness score.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <RevealSection>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Process</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            From idea to startup world
          </h2>
          <p className="mt-3 text-muted-foreground">
            LaunchMyIdea AI turns a rough concept into a visible multi-agent
            company simulation.
          </p>
        </div>
      </RevealSection>

      <div ref={ref} className="relative mt-16">
        <div className="absolute left-4 top-12 hidden h-px w-[calc(100%-2rem)] bg-border lg:block" />
        <motion.div
          initial={false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute left-4 top-12 hidden h-px w-[calc(100%-2rem)] origin-left lg:block"
          style={{ background: "#FF2D2D" }}
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {steps.map(({ n, Icon, title, desc }, i) => (
            <motion.div
              key={n}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-2xl border border-border p-6"
              style={{ background: "#111111" }}
            >
              <div className="flex items-start justify-between">
                <motion.span
                  animate={
                    inView
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(255,45,45,0)",
                            "0 0 0 14px rgba(255,45,45,0)",
                            "0 0 0 0 rgba(255,45,45,0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1.4, delay: 0.2 + i * 0.15 }}
                  className="inline-flex items-center justify-center rounded-lg border border-[rgba(255,45,45,0.4)] bg-[rgba(255,45,45,0.08)] px-2 py-1 font-display text-xs font-bold text-primary"
                >
                  {n}
                </motion.span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
