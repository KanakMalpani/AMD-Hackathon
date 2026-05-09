import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/HowItWorks";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — LaunchMyIdea AI" },
      { name: "description", content: "From a raw idea to a critic-reviewed launch package in four steps." },
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
