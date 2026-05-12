import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function RevealSection({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ opacity: 1, transform: "translateY(0px)" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
