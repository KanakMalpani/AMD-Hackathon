import { createFileRoute } from "@tanstack/react-router";
import { FeaturesSection } from "@/components/FeaturesSection";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features - Autonomous Startup-in-a-Box" },
      {
        name: "description",
        content:
          "Explore the multi-agent runtime, startup world builder, live simulation dashboard, and AMD-backed execution story.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <main className="pt-20">
      <FeaturesSection />
    </main>
  );
}
