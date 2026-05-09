import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

export type EmptyStep = {
  icon: LucideIcon;
  title: string;
  description: string;
  done?: boolean;
};

export type EmptyAction = {
  label: string;
  onClick?: () => void;
  to?: "/projects/$projectId/dashboard" | "/projects/$projectId/simulation" | "/projects/$projectId/marketing" | "/projects/$projectId/statistics";
  projectId?: string;
  variant?: "primary" | "ghost";
  icon?: LucideIcon;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  steps,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  steps?: EmptyStep[];
  actions?: EmptyAction[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border p-8 sm:p-12"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, rgba(255,45,45,0.08) 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, rgba(60,255,122,0.06) 0%, transparent 55%), #0e0e10",
        borderColor: "#2A2A2A",
      }}
    >
      {/* glow orb */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,45,45,0.35), transparent)" }}
      />

      <div className="relative max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: "#2A2A2A", background: "#111" }}>
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-weak">{eyebrow}</span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>

        {steps && steps.length > 0 && (
          <ol className="mt-7 grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                  className="rounded-2xl border p-4"
                  style={{
                    background: s.done ? "rgba(60,255,122,0.06)" : "#111",
                    borderColor: s.done ? "rgba(60,255,122,0.4)" : "#2A2A2A",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{
                        background: s.done ? "rgba(60,255,122,0.15)" : "rgba(255,45,45,0.12)",
                        color: s.done ? "#3CFF7A" : "#FF8585",
                      }}
                    >
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4" style={{ color: s.done ? "#3CFF7A" : "#FF8585" }} />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{s.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                </motion.li>
              );
            })}
          </ol>
        )}

        {actions && actions.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {actions.map((a, i) => {
              const Icon = a.icon ?? ArrowRight;
              const isPrimary = a.variant !== "ghost";
              const cls =
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5";
              const style = isPrimary
                ? { background: "#FF2D2D", color: "white", boxShadow: "0 0 24px rgba(255,45,45,0.35)" }
                : { background: "#111", color: "#F8F8F8", border: "1px solid #2A2A2A" };
              if (a.to && a.projectId) {
                return (
                  <Link key={i} to={a.to} params={{ projectId: a.projectId }} className={cls} style={style}>
                    <Icon className="h-4 w-4" /> {a.label}
                  </Link>
                );
              }
              return (
                <button key={i} onClick={a.onClick} className={cls} style={style}>
                  <Icon className="h-4 w-4" /> {a.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
