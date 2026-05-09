import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,45,45,0.18), transparent 60%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: "#FF2D2D" }}>
          <Rocket className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="font-display font-semibold">
          Autonomous Startup<span className="text-primary"> Box</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border p-8 backdrop-blur-xl"
        style={{
          background: "rgba(17,17,17,0.78)",
          borderColor: "#2A2A2A",
          boxShadow: "0 0 60px rgba(255,45,45,0.12), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="mt-6 text-center text-xs text-muted-foreground">{footer}</div>
      </motion.div>
    </div>
  );
}
