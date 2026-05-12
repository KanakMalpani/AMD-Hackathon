import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, PencilLine, Activity, BarChart3, Globe } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useStore } from "@/lib/app-store";
import {
  getAssumptions,
  getBreakdown,
  getCompetitors,
  getEffortBars,
  getGrowthProjection,
  getResearchSources,
  getRiskBars,
  getTargetAudience,
} from "@/lib/report-view";

export const Route = createFileRoute("/_app/projects/$projectId/statistics")({
  head: () => ({ meta: [{ title: "Insights - LaunchMyIdea AI" }] }),
  component: StatisticsPage,
});

function StatisticsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
          Back to startups
        </button>
      </AppLayout>
    );
  }

  if (!project.outputsReady) {
    return (
      <AppLayout topbar={<Topbar project={project} />}>
        <EmptyState
          eyebrow="Statistics"
          title="No metrics to show — yet."
          description="Launch readiness, revenue projections, risk, and assumptions appear once the simulation finishes. Write your prompt and run the simulation to populate every chart on this page."
          steps={[
            { icon: PencilLine, title: "Write your prompt", description: "Describe your idea on the dashboard.", done: !!project.idea?.trim() },
            { icon: Activity, title: "Run the simulation", description: "Agents will validate, score, and project your launch." },
            { icon: BarChart3, title: "Read the numbers", description: "Charts and risk breakdowns light up here." },
          ]}
          actions={[
            { label: project.idea?.trim() ? "Run simulation" : "Open dashboard", to: project.idea?.trim() ? "/projects/$projectId/simulation" : "/projects/$projectId/dashboard", projectId: project.id, icon: project.idea?.trim() ? Activity : PencilLine },
          ]}
        />
      </AppLayout>
    );
  }

  const report = project.simulationReport;
  const breakdown = getBreakdown(project);
  const growth = getGrowthProjection(project);
  const seriesK = growth.months.map((m) => m.users);
  const seriesLabels = growth.months.map((m) => m.usersLabel);
  const lastUsersLabel = growth.months[growth.months.length - 1]?.usersLabel ?? "0";
  const riskBars = getRiskBars(project);
  const effortBars = getEffortBars(project);
  const assumptions = getAssumptions(project);
  const competitors = getCompetitors(project);
  const sources = getResearchSources(report);

  const overview = [
    { label: "Launch readiness", value: `${project.launchReadiness}/100`, trend: "up" as const, tone: "green" as const },
    { label: "Market validation", value: `${breakdown.market}%`, trend: "up" as const, tone: "green" as const },
    { label: "MVP feasibility", value: `${breakdown.mvp}%`, trend: "up" as const, tone: "green" as const },
    { label: "Growth potential", value: `${lastUsersLabel} users / mo 6`, trend: "up" as const, tone: "green" as const },
    { label: "Risk level", value: breakdown.differentiation < 70 ? "Medium" : "Low", trend: "down" as const, tone: "red" as const },
    { label: "Execution readiness", value: `${breakdown.execution}%`, trend: "up" as const, tone: "green" as const },
  ];

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-weak">Startup intelligence</div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Insights</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {overview.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ background: "#111", borderColor: "#2A2A2A" }}
          >
            <div className="text-[10px] uppercase tracking-wider text-weak">{s.label}</div>
            <div className="mt-1 flex items-end justify-between">
              <CountUp value={s.value} />
              {s.trend === "up" ? (
                <TrendingUp className="h-4 w-4" style={{ color: "#3CFF7A" }} />
              ) : (
                <TrendingDown className="h-4 w-4" style={{ color: "#FF8585" }} />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Readiness breakdown */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Launch readiness breakdown</h3>
          <div className="space-y-3">
            {Object.entries(breakdown).filter(([k]) => k !== "overall").map(([k, v], i) => (
              <Bar key={k} label={labelFor(k)} value={v as number} delay={i * 0.08} />
            ))}
          </div>
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Growth projection (6 months)</h3>
          <RevenueChart series={seriesK} labels={seriesLabels} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Cost / effort estimate */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Effort estimate</h3>
          <div className="space-y-3">
            {effortBars.map(({ label, value }, i) => (
              <Bar key={label} label={label} value={value} delay={i * 0.08} tone="muted" suffix="%" />
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Risk breakdown</h3>
          <div className="space-y-3">
            {riskBars.map(({ label, value }, i) => (
              <Bar key={label} label={label} value={value} delay={i * 0.08} tone="red" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Assumptions */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Assumptions</h3>
          <ul className="space-y-2 text-xs">
            {assumptions.map(([l, v]) => (
              <li key={l} className="flex justify-between border-b pb-2 last:border-0" style={{ borderColor: "#2A2A2A" }}>
                <span className="text-muted-foreground">{l}</span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Critic risk */}
        <div
          className="rounded-2xl border p-5"
          style={{
            background: "linear-gradient(135deg, #111 0%, rgba(255,45,45,0.05) 100%)",
            borderColor: "rgba(255,45,45,0.4)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: "#FF8585" }} />
            <h3 className="font-display text-sm font-semibold">Critic risk analysis</h3>
          </div>
          <ul className="space-y-3 text-xs">
            <Risk label="Primary audience" value={getTargetAudience(project)} />
            <Risk label="Main failure mode" value={report?.outputs.critic.main_failure_mode ?? "Run the simulation to unlock critic analysis."} />
            <Risk label="What to test before building" value={report?.outputs.marketing.next_step ?? "Validate the sharpest channel first."} />
            <Risk label="How to reduce risk" value={report?.outputs.critic.fix_first?.[0] ?? "Narrow the first wedge and test it quickly."} />
          </ul>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">Research evidence</h3>
          </div>
          <div className="space-y-3 text-xs">
            <Risk label="Target user" value={report?.research.target_user ?? getTargetAudience(project)} />
            <Risk label="Competitor set" value={competitors.join(", ")} />
            <Risk label="Research summary" value={report?.research.summary ?? growth.summary} />
          </div>
          {sources.length > 0 && (
            <div className="mt-4 space-y-2">
              {sources.slice(0, 4).map((source) => (
                <a
                  key={source.url || source.title}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border p-3 text-xs transition-colors hover:border-[rgba(255,45,45,0.45)]"
                  style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
                >
                  <div className="font-semibold text-foreground">{source.title}</div>
                  <div className="mt-1 text-muted-foreground">{source.note}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function labelFor(k: string) {
  const m: Record<string, string> = {
    problem: "Problem clarity",
    market: "Market demand",
    mvp: "MVP feasibility",
    differentiation: "Differentiation",
    revenue: "Revenue logic",
    execution: "Execution readiness",
  };
  return m[k] ?? k;
}

function CountUp({ value }: { value: string }) {
  const [v, setV] = useState("0");
  useEffect(() => {
    const m = value.match(/^(\d+)/);
    if (!m) {
      setV(value);
      return;
    }
    const target = parseInt(m[1], 10);
    const suffix = value.slice(m[1].length);
    let cur = 0;
    const step = Math.max(1, Math.floor(target / 24));
    const id = setInterval(() => {
      cur = Math.min(target, cur + step);
      setV(cur + suffix);
      if (cur >= target) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <div className="font-display text-xl font-bold">{v}</div>;
}

function Bar({
  label,
  value,
  delay,
  tone = "green",
  suffix = "",
}: {
  label: string;
  value: number;
  delay?: number;
  tone?: "green" | "red" | "muted";
  suffix?: string;
}) {
  const grad =
    tone === "red"
      ? "linear-gradient(90deg,#FF2D2D,#FF8585)"
      : tone === "muted"
        ? "linear-gradient(90deg,#3a3a40,#5c5c66)"
        : "linear-gradient(90deg,#FF2D2D,#3CFF7A)";
  const glow =
    tone === "red"
      ? "0 0 12px rgba(255,45,45,0.35)"
      : tone === "green"
        ? "0 0 12px rgba(60,255,122,0.25)"
        : "none";
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1c]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: grad, boxShadow: glow }}
        />
      </div>
    </div>
  );
}

function RevenueChart({ series, labels }: { series: number[]; labels: string[] }) {
  const max = Math.max(...series);
  const w = 360;
  const h = 160;
  const pad = 24;
  const points = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const fillPath = `${path} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="rev-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF2D2D" />
            <stop offset="100%" stopColor="#3CFF7A" />
          </linearGradient>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(60,255,122,0.25)" />
            <stop offset="100%" stopColor="rgba(60,255,122,0)" />
          </linearGradient>
        </defs>
        <motion.path d={fillPath} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#rev-stroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill="#FF2D2D" />
            <text x={x} y={h - 6} fontSize="9" textAnchor="middle" fill="#71717A">M{i + 1}</text>
            <text x={x} y={y - 8} fontSize="9" textAnchor="middle" fill="#A1A1AA">{labels[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Risk({ label, value }: { label: string; value: string }) {
  return (
    <li>
      <div className="text-[10px] uppercase tracking-wider text-weak">{label}</div>
      <div className="mt-0.5">{value}</div>
    </li>
  );
}
