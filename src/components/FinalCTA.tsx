import { Rocket } from "lucide-react";
import { AnimatedButton } from "./AnimatedButton";
import { RevealSection } from "./RevealSection";
import { useStartLaunch } from "@/lib/use-start-launch";

export function FinalCTA() {
  const start = useStartLaunch();
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-border p-10 text-center sm:p-16"
        style={{ background: "#0a0a0a" }}
      >
        <RevealSection>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
            Turn one raw idea into a <span className="text-highlight">launch-ready</span> startup package.
          </h2>
        </RevealSection>
        <RevealSection delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Build your first launch-ready startup package in minutes.
          </p>
        </RevealSection>
        <RevealSection delay={0.2}>
          <div className="mt-8 flex justify-center">
            <AnimatedButton icon={<Rocket className="h-4 w-4" />} onClick={() => start()}>
              Launch My Idea
            </AnimatedButton>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
