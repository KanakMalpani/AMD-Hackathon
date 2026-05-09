import { createFileRoute } from "@tanstack/react-router";
import { FinalCTA } from "@/components/FinalCTA";
import { GrowthSection } from "@/components/GrowthSection";
import { HeroSection } from "@/components/HeroSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Autonomous Startup-in-a-Box - AMD Multi-Agent Startup Simulator" },
      {
        name: "description",
        content:
          "Autonomous Startup-in-a-Box turns a raw startup idea into a visible AMD-powered multi-agent simulation spanning strategy, MVP, launch, and revenue logic.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <HeroSection />
      <GrowthSection />
      <FinalCTA />
    </main>
  );
}
