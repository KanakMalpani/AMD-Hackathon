import {
  ShieldCheck,
  LayoutGrid,
  FileText,
  Code2,
  Megaphone,
  LineChart,
  Eye,
  Gauge,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { RevealSection } from "./RevealSection";

const features = [
  { Icon: ShieldCheck, title: "Market Validation", description: "Pressure-tests the problem, audience, and competitive landscape." },
  { Icon: LayoutGrid, title: "MVP Blueprint", description: "Defines core scope, must-have features, and the v1 user flow." },
  { Icon: FileText, title: "Landing Page Copy", description: "Generates a hero, value prop, features, and CTA copy ready to ship." },
  { Icon: Code2, title: "Code Structure", description: "Suggests stack, folder layout, and module boundaries for the MVP." },
  { Icon: Megaphone, title: "Marketing Strategy", description: "Lays out channels, positioning, and a 30-day launch plan." },
  { Icon: LineChart, title: "Revenue Simulation", description: "Models pricing, conversion, and a realistic monthly revenue range.", green: true },
  { Icon: Eye, title: "Critic Review", description: "Stress-tests assumptions and surfaces the weakest links to fix first." },
  { Icon: Gauge, title: "Launch Readiness Score", description: "A single score that tells you exactly how close you are to ship.", green: true },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <RevealSection>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">Capabilities</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Everything an idea needs to become a <span className="text-highlight">launch</span>.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Eight focused modules that turn raw thinking into a ship-ready package.
          </p>
        </div>
      </RevealSection>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 0.06} />
        ))}
      </div>
    </section>
  );
}
