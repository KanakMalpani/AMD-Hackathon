import { motion } from "framer-motion";

export type Strength = "empty" | "weak" | "medium" | "strong";

export function getStrength(pw: string): Strength {
  if (!pw) return "empty";
  const strong =
    pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);
  if (strong) return "strong";
  const medium = pw.length >= 6 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  if (medium) return "medium";
  return "weak";
}

const META: Record<Strength, { label: string; width: string; color: string }> = {
  empty: { label: "", width: "0%", color: "#2A2A2A" },
  weak: { label: "Weak", width: "33%", color: "#FF2D2D" },
  medium: { label: "Medium", width: "66%", color: "#F5B400" },
  strong: { label: "Strong", width: "100%", color: "#3CFF7A" },
};

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const s = getStrength(password);
  const m = META[s];
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1c]">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: m.width, backgroundColor: m.color }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-weak">
        <span>password strength</span>
        <span style={{ color: m.color === "#2A2A2A" ? undefined : m.color }}>{m.label}</span>
      </div>
    </div>
  );
}
