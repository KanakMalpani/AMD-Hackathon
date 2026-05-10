import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatedButton } from "./AnimatedButton";

const links = [
  { label: "Features", to: "/features" as const },
  { label: "How It Works", to: "/how-it-works" as const },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border"
      style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(14px)" }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: "#FF2D2D" }}
          >
            <Rocket className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            LaunchMyIdea<span className="text-primary"> AI</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="story-link text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "story-link text-sm text-foreground" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/signup">
            <AnimatedButton icon={<Rocket className="h-4 w-4" />}>
              Enter Runtime
            </AnimatedButton>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
