import { motion } from "framer-motion";
import { Cpu, Zap } from "lucide-react";

export function AMDComputePanel({ active }: { active: boolean }) {
  const rows: { label: string; value: string; tone?: "red" | "green" | "muted" }[] = [
    { label: "Acceleration", value: active ? "Active" : "Standby", tone: active ? "red" : "muted" },
    { label: "Parallel Workflows", value: active ? "6" : "0" },
    { label: "Avg Response Time", value: "1.8s", tone: "green" },
    { label: "Speedup Preview", value: "4.1×", tone: "green" },
    { label: "Model Runtime", value: "ROCm-ready" },
    { label: "Inference Stack", value: "vLLM-ready" },
  ];
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{
              background: active ? "rgba(255,45,45,0.12)" : "#181818",
              border: `1px solid ${active ? "rgba(255,45,45,0.5)" : "#2A2A2A"}`,
            }}
          >
            <Cpu className="h-3.5 w-3.5" style={{ color: active ? "#FF2D2D" : "#A1A1AA" }} />
          </span>
          <h3 className="font-display text-sm font-semibold">Compute Performance Preview</h3>
        </div>
        <motion.span
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider"
          style={{ color: active ? "#FF2D2D" : "#71717A" }}
          animate={active ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <Zap className="h-3 w-3" /> {active ? "Live" : "Idle"}
        </motion.span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-lg border px-3 py-2"
            style={{ background: "#0c0c0e", borderColor: "#1f1f22" }}
          >
            <div className="text-[10px] uppercase tracking-wider text-weak">{r.label}</div>
            <div
              className="mt-0.5 text-sm font-semibold"
              style={{
                color:
                  r.tone === "red"
                    ? "#FF8585"
                    : r.tone === "green"
                      ? "#3CFF7A"
                      : r.tone === "muted"
                        ? "#A1A1AA"
                        : "#F8F8F8",
              }}
            >
              {r.value}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-weak">Preview metrics for hackathon demonstration.</p>
    </div>
  );
}
