import { motion } from "framer-motion";
import type { ActivityMsg, AgentPersona, Stage } from "@/lib/app-store";

type NodeItem = {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  status: "pending" | "running" | "complete";
  kind: "stage" | "agent";
};

type Connection = {
  from: string;
  to: string;
};

const STAGE_CONNECTIONS: Connection[] = [
  { from: "seed", to: "strategy" },
  { from: "strategy", to: "world" },
  { from: "strategy", to: "build" },
  { from: "agents", to: "build" },
  { from: "build", to: "launch" },
  { from: "build", to: "critic" },
  { from: "finance", to: "critic" },
  { from: "critic", to: "report" },
];

function colorFor(status: NodeItem["status"]) {
  if (status === "complete") {
    return {
      border: "rgba(60,255,122,0.55)",
      glow: "0 0 28px rgba(60,255,122,0.18)",
      badge: "#3CFF7A",
      bg: "rgba(60,255,122,0.10)",
    };
  }
  if (status === "running") {
    return {
      border: "rgba(255,45,45,0.55)",
      glow: "0 0 30px rgba(255,45,45,0.18)",
      badge: "#FF8585",
      bg: "rgba(255,45,45,0.12)",
    };
  }
  return {
    border: "#2A2A2A",
    glow: "none",
    badge: "#8D8D98",
    bg: "rgba(255,255,255,0.03)",
  };
}

export function SimulationNodeGraph({
  stages,
  agents,
  activity,
  stageInsights,
  agentFindings,
}: {
  stages: Stage[];
  agents?: AgentPersona[];
  activity: ActivityMsg[];
  stageInsights?: Record<string, string>;
  agentFindings?: Record<string, string>;
}) {
  const stageNodes: NodeItem[] = stages.map((stage, index) => ({
    id: stage.key,
    title: stage.title,
    subtitle: stageInsights?.[stage.key] ?? stage.description,
    x: 110 + (index % 3) * 280,
    y: 90 + Math.floor(index / 3) * 170,
    status: stage.status,
    kind: "stage",
  }));

  const agentNodes: NodeItem[] = (agents ?? []).slice(0, 6).map((agent, index) => ({
    id: agent.name,
    title: agent.name,
    subtitle: agentFindings?.[agent.name] ?? agent.role,
    x: 980 + (index % 2) * 220,
    y: 100 + Math.floor(index / 2) * 150,
    status: activity.some((item) => item.agent === agent.name && item.done)
      ? "complete"
      : activity.some((item) => item.agent === agent.name)
        ? "running"
        : "pending",
    kind: "agent",
  }));

  const nodeById = new Map([...stageNodes, ...agentNodes].map((node) => [node.id, node]));

  const stageConnections = STAGE_CONNECTIONS.map((connection) => ({
    from: nodeById.get(connection.from),
    to: nodeById.get(connection.to),
  })).filter((connection): connection is { from: NodeItem; to: NodeItem } => Boolean(connection.from && connection.to));

  const agentAnchorIds = ["world", "launch", "report"];
  const agentConnections = agentNodes
    .map((node, index) => {
      const anchorId = agentAnchorIds[Math.min(Math.floor(index / 2), agentAnchorIds.length - 1)];
      const from = nodeById.get(anchorId);
      return from ? { from, to: node } : null;
    })
    .filter((connection): connection is { from: NodeItem; to: NodeItem } => Boolean(connection));

  const connections = [...stageConnections, ...agentConnections];

  function buildPath(from: NodeItem, to: NodeItem) {
    const x1 = from.x + 180;
    const y1 = from.y + 54;
    const x2 = to.x;
    const y2 = to.y + 54;
    const columnGap = 36;
    const rowGap = 26;

    if (Math.abs(y1 - y2) < 8 || Math.abs(x1 - x2) < 8) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (x2 >= x1) {
      const elbowX = x1 + columnGap;
      return `M ${x1} ${y1} L ${elbowX} ${y1} L ${elbowX} ${y2} L ${x2} ${y2}`;
    }

    const elbowY = y1 + (y2 > y1 ? rowGap : -rowGap);
    return `M ${x1} ${y1} L ${x1} ${elbowY} L ${x2} ${elbowY} L ${x2} ${y2}`;
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{ background: "#09090b", borderColor: "#2A2A2A", minHeight: 620 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.45,
        }}
      />

      <svg className="absolute inset-0 h-full w-full">
        {connections.map((connection, index) => {
          const active =
            connection.from.status === "complete" ||
            connection.from.status === "running" ||
            connection.to.status === "complete" ||
            connection.to.status === "running";
          const path = buildPath(connection.from, connection.to);

          return (
            <motion.path
              key={`${connection.from.id}_${connection.to.id}_${index}`}
              d={path}
              fill="none"
              stroke={active ? "rgba(255,45,45,0.7)" : "rgba(255,255,255,0.08)"}
              strokeWidth={active ? 3 : 2}
              strokeDasharray={active ? "10 10" : "0"}
              initial={{ pathLength: 0.2, opacity: 0.35 }}
              animate={{
                pathLength: 1,
                opacity: active ? 1 : 0.4,
                strokeDashoffset: active ? [-40, 0] : 0,
              }}
              transition={{
                duration: 1.1,
                repeat: active ? Infinity : 0,
                ease: "linear",
              }}
            />
          );
        })}
      </svg>

      <div className="relative h-[620px] w-full">
        {[...stageNodes, ...agentNodes].map((node) => {
          const colors = colorFor(node.status);
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute w-[180px] rounded-2xl border p-4"
              style={{
                left: node.x,
                top: node.y,
                background: colors.bg,
                borderColor: colors.border,
                boxShadow: colors.glow,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-foreground">{node.title}</div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
                  style={{
                    color: colors.badge,
                    border: `1px solid ${colors.border}`,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {node.status}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{node.subtitle}</div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-weak">
                {node.kind === "stage" ? "Simulation Node" : "Agent Node"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
