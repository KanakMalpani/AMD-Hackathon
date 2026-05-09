import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/HeroSection";
import { GrowthSection } from "@/components/GrowthSection";
import { FinalCTA } from "@/components/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaunchMyIdea AI — Stop thinking, start launching" },
      {
        name: "description",
        content:
          "LaunchMyIdea AI turns your startup idea into validation, MVP plan, copy, code structure, marketing and a launch-ready package.",
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
