import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/HowItWorks";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works - Autonomous Startup-in-a-Box" },
      {
        name: "description",
        content: "From one idea to a visible multi-agent company simulation in four steps.",
      },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  return (
    <main className="pt-20">
      <HowItWorks />
    </main>
  );
}
