import { Rocket } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-md"
            style={{ background: "#FF2D2D" }}
          >
            <Rocket className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-display text-sm font-semibold">
            LaunchMyIdea<span className="text-primary"> AI</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-weak">
          <Link to="/features" className="story-link hover:text-foreground">Features</Link>
          <Link to="/how-it-works" className="story-link hover:text-foreground">How It Works</Link>
        </div>
        <div className="text-xs text-weak">© 2026 LaunchMyIdea AI · Hackathon build</div>
      </div>
    </footer>
  );
}
