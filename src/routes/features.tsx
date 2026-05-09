import { createFileRoute } from "@tanstack/react-router";
import { FeaturesSection } from "@/components/FeaturesSection";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — LaunchMyIdea AI" },
      { name: "description", content: "Eight focused modules that turn raw thinking into a ship-ready startup package." },
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
