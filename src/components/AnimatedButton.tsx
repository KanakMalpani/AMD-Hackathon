import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  variant?: Variant;
  icon?: ReactNode;
  glowPulse?: boolean;
  children: ReactNode;
}

export function AnimatedButton({
  variant = "primary",
  icon,
  glowPulse,
  children,
  className = "",
  ...rest
}: Props) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold tracking-tight transition-colors sweep select-none";
  const variants: Record<Variant, string> = {
    primary:
      "text-white",
    secondary:
      "bg-transparent text-foreground border border-border hover:border-[rgba(255,45,45,0.55)] hover:shadow-[0_0_24px_rgba(255,45,45,0.20)]",
    ghost:
      "bg-transparent text-foreground hover:text-primary",
  };

  const primaryStyle =
    variant === "primary"
      ? { background: "#FF2D2D" }
      : undefined;

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.035 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={`${base} ${variants[variant]} ${glowPulse ? "glow-pulse" : ""} ${className}`}
      style={primaryStyle}
      {...(rest as object)}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
