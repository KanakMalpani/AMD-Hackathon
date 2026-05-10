import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Cpu,
  Paperclip,
  PencilLine,
  Play,
  RotateCcw,
} from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { ExecutionTimeline } from "@/components/dashboard/ExecutionTimeline";
import { AgentActivityFeed } from "@/components/dashboard/AgentActivityFeed";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OutputTabs } from "@/components/dashboard/OutputTabs";
import { AMDComputePanel } from "@/components/dashboard/AMDComputePanel";
import {
  store,
  useStore,
  type PromptData,
  type SimulationReport,
} from "@/lib/app-store";
import { buildOutputs } from "@/lib/mock-outputs";
import { generateStartup, getJobStatus, type JobStatusResponse } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/simulation")({
  head: () => ({ meta: [{ title: "Simulation - LaunchMyIdea AI" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ autostart: s.autostart ? 1 : undefined }),
  component: SimulationPage,
});

function fallbackPromptFromProject(project: { idea: string; title: string }): PromptData {
  return {
    idea: project.idea || project.title,
    audience: "",
    problem: "",
    businessModel: "",
    mvpScope: "Simulation report, launch preview, and founder-ready output package.",
    tone: "Bold, cinematic, technically grounded.",
    constraints: "Preserve AMD branding and make the agent process visible.",
    seedContext: "",
    keySignals: "",
    simulationGoal: "",
    amdFocus: "Show why AMD compute makes concurrent startup reasoning feel real.",
  };
}

function buildBrowserFallbackReport(prompt: PromptData): SimulationReport {
  const idea = prompt.idea || "LaunchMyIdea AI simulation";
  const audience = prompt.audience || "hackathon judges, founders, and technical builders";
  const problem = prompt.problem || "founders need a faster way to validate and pressure-test startup ideas";
  const businessModel = prompt.businessModel || "pro workspace subscription with team expansion";
  const channels = ["Hackathon demo", "Founder communities", "LinkedIn build thread", "Short-form walkthrough"];
  const readiness = 84;
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>LaunchMyIdea AI</title>
</head>
<body class="min-h-screen bg-[#050816] text-white">
  <main class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
    <div class="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
      Browser Demo Runtime
      <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
    </div>
    <h1 class="mt-8 text-5xl font-black">${idea}</h1>
    <p class="mt-5 max-w-3xl text-lg text-zinc-300">
      A visible multi-agent startup simulation that turns one idea into strategy, MVP scope, go-to-market, finance logic, and critic feedback.
    </p>
    <ul class="mt-10 flex flex-wrap gap-3">
      ${channels
        .map(
          (channel) =>
            `<li class="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">${channel}</li>`,
        )
        .join("")}
    </ul>
  </main>
</body>
</html>`;

  return {
    title: "LaunchMyIdea AI",
    readiness_score: readiness,
    executive_summary:
      "The public site is running in browser demo mode, but it still executes the full startup-world flow so judges can inspect the agent process and final artifacts.",
    startup_brief: {
      idea,
      audience,
      problem,
      business_model: businessModel,
      tone: prompt.tone || "Bold and cinematic",
      constraints: prompt.constraints || "Preserve AMD branding and keep the simulation visible.",
      seed_context: prompt.seedContext || "No external dossier supplied.",
      key_signals: prompt.keySignals || "Agentic tooling, startup compression, infra storytelling.",
      amd_focus: prompt.amdFocus || "Demonstrate how AMD-backed inference can power concurrent specialist agents.",
    },
    simulation_world: {
      goal: prompt.simulationGoal || "Validate whether the startup can become an investable demo-worthy product.",
      hypothesis:
        "If the product exposes its agent collaboration instead of hiding it behind a single answer, the experience becomes both more trustworthy and more memorable.",
      market_forces: [
        "Founders want feedback loops, not static documents.",
        "Judges reward visible orchestration and technical credibility.",
        "AI demos land harder when the runtime story is inspectable.",
      ],
      intervention_levers: [
        "Tighten the user wedge",
        "Reduce the MVP to one unforgettable loop",
        "Make the AMD compute story visible in the UX",
      ],
      simulation_modes: ["Founder mode", "Judge mode", "Capital-efficient mode"],
    },
    agents: [
      {
        name: "CEO Agent",
        role: "Strategic Leader",
        goal: "Define the company thesis and success criteria.",
        style: "Decisive and macro.",
        deliverable: "Strategy and validation story",
      },
      {
        name: "Product Agent",
        role: "Product Architect",
        goal: "Scope the MVP and core loop.",
        style: "User-obsessed and structured.",
        deliverable: "MVP scope and flow",
      },
      {
        name: "Engineer Agent",
        role: "Systems Builder",
        goal: "Design the implementation path.",
        style: "Pragmatic and performance-aware.",
        deliverable: "Stack and architecture",
      },
      {
        name: "Marketing Agent",
        role: "Growth Strategist",
        goal: "Turn the startup into a story judges want to repeat.",
        style: "Sharp and narrative-driven.",
        deliverable: "Launch plan and hooks",
      },
      {
        name: "Finance Agent",
        role: "Business Analyst",
        goal: "Pressure-test pricing and viability.",
        style: "Analytical and skeptical.",
        deliverable: "Revenue model",
      },
      {
        name: "Critic Agent",
        role: "World Challenger",
        goal: "Attack the plan before the market can.",
        style: "Blunt and rigorous.",
        deliverable: "Risks and iteration path",
      },
    ],
    outputs: {
      validation: {
        market_opportunity: `${audience} already need faster, more visible startup validation loops.`,
        why_now: "Agentic UX is finally compelling enough to make orchestration part of the product.",
        differentiation: "This app stages a company simulation instead of dumping a generic startup report.",
        risks: [
          "The wow moment may not convert into repeat usage.",
          "The runtime story needs real compute backing for production credibility.",
          "Too much UI complexity can dilute the core pitch.",
        ],
      },
      product: {
        north_star: "Give founders a startup mirror world they can interrogate before spending real money and time.",
        core_loop: "Brief -> multi-agent run -> inspect report -> refine thesis -> rerun.",
        mvp_features: [
          "Startup brief composer",
          "Visible agent runtime",
          "Simulation dashboard",
          "Go-to-market and finance report",
          "AMD compute story panel",
        ],
        persona_tracks: ["Founder", "Judge", "Technical builder"],
        first_release_scope:
          prompt.mvpScope || "Simulation brief, visible run, final report, and live preview.",
      },
      engineering: {
        stack: ["React + TanStack Router", "FastAPI", "Vercel", "AMD-hosted OpenAI-compatible models"],
        architecture: [
          "Frontend drives the simulation shell and report experience.",
          "Backend orchestrator can run real agent turns when connected.",
          "Browser runtime fallback keeps the public demo functional without a hosted API.",
        ],
        preview_html: previewHtml,
      },
      marketing: {
        narrative: "Rehearse the startup before the market rehearses your failure for you.",
        channels,
        hook_lines: [
          "Six AI agents. One startup. One visible runtime.",
          "This is not a chatbot. It is a company in a sandbox.",
          "Show the judges the startup thinking in parallel.",
        ],
        judge_pitch:
          "We transformed startup planning into an inspectable agent system that can later be powered by AMD-hosted model inference.",
      },
      finance: {
        pricing: "Free demo tier, pro founder tier, and team workspace tier.",
        revenue_logic: "Monetize deeper simulations, saved workspaces, exports, and collaboration.",
        cost_drivers: [
          "Model inference time",
          "Report generation and storage",
          "Future data and deployment integrations",
        ],
        first_year: "The strongest traction path is demo-led adoption that becomes a founder workflow.",
      },
      critic: {
        main_failure_mode: "Users love the first run but do not return unless iteration feels materially better.",
        hardest_assumption: "Founders want repeated simulations, not just a one-off report.",
        fix_first: [
          "Make reruns clearly better with new constraints.",
          "Expose decisions, not just glossy copy.",
          "Connect the runtime to a real AMD-hosted backend for production credibility.",
        ],
      },
    },
  };
}

function SimulationPage() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch() as { autostart?: number };
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [running, setRunning] = useState(false);
  const [runtimeLabel, setRuntimeLabel] = useState("Idle");
  const [jobStartedAt, setJobStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [jobId, setJobId] = useState("");
  const startedFromAutostart = useRef(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!jobStartedAt || !running) return;
    const timer = window.setInterval(() => {
      setElapsed(Date.now() - jobStartedAt);
    }, 150);
    return () => window.clearInterval(timer);
  }, [jobStartedAt, running]);

  useEffect(() => {
    if (search.autostart && project && !startedFromAutostart.current) {
      startedFromAutostart.current = true;
      window.setTimeout(() => {
        void start();
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Workspace not found" />}>
        <div
          className="rounded-2xl border p-10 text-center"
          style={{ background: "#111", borderColor: "#2A2A2A" }}
        >
          <button
            onClick={() => navigate({ to: "/projects" })}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ background: "#FF2D2D" }}
          >
            Back to workspaces
          </button>
        </div>
      </AppLayout>
    );
  }

  function clearPolling() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function runBrowserFallback(prompt: PromptData) {
    const stages = [
      { key: "seed", title: "Reality Seed", description: "Startup premise and source signals locked", status: "complete" as const },
      { key: "strategy", title: "CEO Strategy", description: "Thesis, wedge, and mission drafted", status: "complete" as const },
      { key: "world", title: "World Model", description: "Market forces and simulation modes assembled", status: "complete" as const },
      { key: "agents", title: "Agent Cast", description: "Specialist personas and responsibilities generated", status: "complete" as const },
      { key: "build", title: "Build Plan", description: "MVP stack, flow, and preview scaffold designed", status: "complete" as const },
      { key: "launch", title: "Launch Motion", description: "Narrative, channels, and GTM hooks generated", status: "complete" as const },
      { key: "finance", title: "Revenue Model", description: "Pricing, cost logic, and viability evaluated", status: "complete" as const },
      { key: "critic", title: "Critic Loop", description: "Weak assumptions attacked and improved", status: "complete" as const },
      { key: "report", title: "AMD Report", description: "Final startup-world report published", status: "complete" as const },
    ];
    const activity = [
      "Reality seed locked in the browser runtime.",
      "CEO Agent framed the startup wedge and world hypothesis.",
      "Product Agent scoped the MVP loop and user tracks.",
      "Engineer Agent mapped the system architecture and preview path.",
      "Marketing Agent drafted narrative, hooks, and launch channels.",
      "Finance Agent pressure-tested pricing and cost drivers.",
      "Critic Agent attacked the weakest assumption and proposed fixes.",
      "Orchestrator published the final startup-world report.",
    ].map((text, index) => ({
      id: `browser_${index}`,
      agent:
        index === 0
          ? "Orchestrator"
          : index === 1
            ? "CEO Agent"
            : index === 2
              ? "Product Agent"
              : index === 3
                ? "Engineer Agent"
                : index === 4
                  ? "Marketing Agent"
                  : index === 5
                    ? "Finance Agent"
                    : index === 6
                      ? "Critic Agent"
                      : "Orchestrator",
      text,
      ts: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      done: true,
    }));
    const report = buildBrowserFallbackReport(prompt);

    store.syncSimulation(project.id, {
      activity,
      stages,
      currentStage: stages.length - 1,
      launchReadiness: report.readiness_score,
      simulationReport: report,
      outputsReady: true,
      backendOutput: JSON.stringify(report, null, 2),
      status: "Launch Ready",
    });
    setRuntimeLabel("Browser demo runtime");
    setRunning(false);
    setElapsed(3200);
    toast.info("Backend unavailable - running browser demo runtime.");
    toast.success("Startup world simulation complete.");
  }

  function syncFromStatus(status: JobStatusResponse) {
    const stages = status.stages ?? project.stages;
    const currentStage = Math.max(
      0,
      stages.findIndex((stage) => stage.status === "running"),
    );

    store.syncSimulation(project.id, {
      activity: status.activity ?? project.activity,
      stages,
      launchReadiness: status.readiness ?? project.launchReadiness,
      currentStage,
      status:
        status.status === "completed"
          ? "Launch Ready"
          : status.status === "running"
            ? "Simulating"
            : project.status,
      ...(status.report ? { simulationReport: status.report } : {}),
      ...(status.output ? { backendOutput: status.output } : {}),
    });
  }

  async function pollStatus(activeJobId: string) {
    try {
      const status = await getJobStatus(activeJobId);
      syncFromStatus(status);

      if (status.started_at) {
        setJobStartedAt(status.started_at);
      }

      if (status.runtime?.mock_mode) {
        setRuntimeLabel("Mock multi-agent runtime");
      } else if (status.runtime?.mode === "multi-agent") {
        setRuntimeLabel("AMD multi-agent runtime");
      } else {
        setRuntimeLabel("Live orchestration");
      }

      if (status.status === "completed" && status.output) {
        clearPolling();
        store.syncSimulation(project.id, {
          outputsReady: true,
          backendOutput: status.output,
          simulationReport: status.report,
          launchReadiness: status.readiness ?? status.report?.readiness_score ?? 90,
          status: "Launch Ready",
        });
        setElapsed(
          status.completed_at && status.started_at
            ? status.completed_at - status.started_at
            : elapsed,
        );
        setRunning(false);
        toast.success("Startup world simulation complete.");
      } else if (status.status === "failed") {
        clearPolling();
        setRunning(false);
        setRuntimeLabel("Runtime failed");
        toast.error(status.error ?? "Simulation failed.");
      }
    } catch (error) {
      console.error("Polling error", error);
    }
  }

  async function start() {
    clearPolling();
    store.resetSimulation(project.id);
    store.updateProject(project.id, { status: "Simulating" });
    setRunning(true);
    setElapsed(0);
    setJobStartedAt(Date.now());
    setRuntimeLabel("Connecting to runtime...");

    const prompt = project.prompt ?? fallbackPromptFromProject(project);

    try {
      const response = await generateStartup(prompt);
      setJobId(response.job_id);
      setRuntimeLabel(
        response.runtime?.mock_mode ? "Mock multi-agent runtime" : "AMD multi-agent runtime",
      );
      toast.info(
        response.runtime?.mock_mode
          ? "Mock multi-agent runtime started."
          : "AMD multi-agent runtime engaged.",
      );

      await pollStatus(response.job_id);
      pollRef.current = window.setInterval(() => {
        void pollStatus(response.job_id);
      }, 1200);
    } catch (err) {
      console.error(err);
      runBrowserFallback(prompt);
    }
  }

  function restart() {
    clearPolling();
    setRunning(false);
    setElapsed(0);
    setJobStartedAt(null);
    setRuntimeLabel("Idle");
    setJobId("");
    store.resetSimulation(project.id);
    toast("Simulation reset.");
  }

  const out = buildOutputs(project);
  const report = project.simulationReport;
  const elapsedStr = `${Math.floor(elapsed / 1000)}.${String(
    Math.floor((elapsed % 1000) / 100),
  )}s`;
  const completed = project.stages.filter((s) => s.status === "complete").length;
  const activeStage = project.stages.find((s) => s.status === "running");
  const iter = activeStage
    ? project.stages.findIndex((s) => s.key === activeStage.key) + 1
    : Math.max(1, completed);

  const previewCards = useMemo(
    () =>
      report
        ? [
            {
              key: "hypothesis",
              title: "World Hypothesis",
              body: report.simulation_world.hypothesis,
              score: report.readiness_score,
              ready: true,
            },
            {
              key: "north",
              title: "North Star",
              body: report.outputs.product.north_star,
              score: report.readiness_score - 4,
              ready: true,
            },
            {
              key: "narrative",
              title: "Launch Narrative",
              body: report.outputs.marketing.narrative,
              score: report.readiness_score - 6,
              ready: true,
            },
            {
              key: "pricing",
              title: "Pricing",
              body: report.outputs.finance.pricing,
              score: report.readiness_score - 10,
              ready: true,
            },
            {
              key: "critic",
              title: "Critic",
              body: report.outputs.critic.main_failure_mode,
              score: report.readiness_score - 8,
              ready: true,
            },
          ]
        : [
            {
              key: "validation",
              title: "Validation",
              body: out.validation.differentiation,
              score: out.validation.score,
              ready: completed >= 2,
            },
            {
              key: "mvp",
              title: "MVP",
              body: out.mvp.firstVersion,
              score: 85,
              ready: completed >= 4,
            },
            {
              key: "landing",
              title: "Launch Narrative",
              body: out.marketing.icp,
              score: 80,
              ready: completed >= 6,
            },
            {
              key: "growth",
              title: "Growth",
              body: out.growth.summary,
              score: 78,
              ready: completed >= 7,
            },
            {
              key: "critic",
              title: "Critic",
              body: out.critic.weakest,
              score: 69,
              ready: completed >= 8,
            },
          ],
    [completed, out, report],
  );

  const isEmpty =
    !project.idea?.trim() &&
    !running &&
    project.activity.length === 0 &&
    !project.outputsReady;

  return (
    <AppLayout topbar={<Topbar project={project} onRunSimulation={start} />}>
      {isEmpty ? (
        <EmptyState
          eyebrow="Simulation"
          title="Nothing to simulate yet."
          description="The simulation runs your idea through a staged startup world: reality seed, strategy, agent cast, build plan, launch motion, and critic loop."
          steps={[
            {
              icon: PencilLine,
              title: "Write your brief",
              description: "Open the brief page and define the world seed.",
            },
            {
              icon: Paperclip,
              title: "Add source signals",
              description: "Ground the simulation with constraints, signals, and AMD focus.",
            },
            {
              icon: Activity,
              title: "Run the startup world",
              description: "Watch the agents build and challenge the company in real time.",
            },
          ]}
          actions={[
            {
              label: "Open brief",
              to: "/projects/$projectId/prompts",
              projectId: project.id,
              icon: PencilLine,
            },
            { label: "Run anyway", onClick: start, variant: "ghost", icon: Play },
          ]}
        />
      ) : (
        <>
          <div className="mb-6">
            <AMDComputePanel active={running} />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div
              className="rounded-2xl border p-5"
              style={{ background: "rgba(255,45,45,0.05)", borderColor: "rgba(255,45,45,0.3)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
                  <span className="animate-pulse text-primary">●</span> AMD Multi-Agent Runtime
                </h3>
                <span className="font-mono text-xs text-primary">
                  {Math.min(100, project.launchReadiness)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.launchReadiness}%` }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#FF2D2D,#3CFF7A)" }}
                />
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                <span>Job: {jobId ? jobId.slice(0, 8) : "not started"}</span>
                <span>Status: {runtimeLabel}</span>
              </div>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{ background: "#111", borderColor: "#2A2A2A" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-muted-foreground">
                  <Cpu className="h-4 w-4 text-primary" /> Startup World Score
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {report?.readiness_score ?? project.launchReadiness}/100
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report?.executive_summary ??
                  "Waiting for the runtime to synthesize the final company simulation."}
              </p>
            </div>
          </div>

          <div
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
            style={{ background: "#111", borderColor: "#2A2A2A" }}
          >
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Status</div>
                <div className="font-semibold">
                  {running ? (
                    <span className="text-primary">Running...</span>
                  ) : project.outputsReady ? (
                    <span style={{ color: "#3CFF7A" }}>Complete</span>
                  ) : (
                    <span className="text-muted-foreground">Idle</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Elapsed</div>
                <div className="font-mono font-semibold">{elapsedStr}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Stage</div>
                <div className="font-semibold">
                  {iter}/{project.stages.length}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CtrlBtn onClick={start} primary disabled={running}>
                <Play className="h-3.5 w-3.5" /> Start
              </CtrlBtn>
              <CtrlBtn onClick={restart}>
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </CtrlBtn>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div
              className="rounded-2xl border p-5"
              style={{ background: "#111", borderColor: "#2A2A2A" }}
            >
              <h3 className="mb-4 font-display text-sm font-semibold">Simulation timeline</h3>
              <ExecutionTimeline stages={project.stages} />
            </div>
            <div
              className="rounded-2xl border p-5"
              style={{ background: "#111", borderColor: "#2A2A2A" }}
            >
              <h3 className="mb-4 font-display text-sm font-semibold">Agent activity feed</h3>
              <AgentActivityFeed messages={project.activity} />
            </div>
            <div
              className="rounded-2xl border p-5"
              style={{ background: "#111", borderColor: "#2A2A2A" }}
            >
              <h3 className="mb-4 font-display text-sm font-semibold">World summary</h3>
              <div className="space-y-3">
                {previewCards.map((c, i) => (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border p-3"
                    style={{
                      background: "#0c0c0e",
                      borderColor: c.ready ? "rgba(60,255,122,0.4)" : "#2A2A2A",
                      boxShadow: c.ready ? "0 0 14px rgba(60,255,122,0.18)" : "none",
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold">{c.title}</span>
                      {c.ready && (
                        <span className="text-[10px] font-semibold" style={{ color: "#3CFF7A" }}>
                          {c.score}
                        </span>
                      )}
                    </div>
                    {c.ready ? (
                      <p className="line-clamp-3 text-[11px] text-muted-foreground">{c.body}</p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="h-2 w-3/4 animate-pulse rounded bg-[#1c1c1f]" />
                        <div className="h-2 w-1/2 animate-pulse rounded bg-[#1c1c1f]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {project.outputsReady && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border p-6"
                style={{
                  background: "linear-gradient(135deg,#111 0%, rgba(60,255,122,0.05) 100%)",
                  borderColor: "rgba(60,255,122,0.4)",
                }}
              >
                <div className="grid gap-6 sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">
                      Startup world score
                    </div>
                    <div className="mt-1 font-display text-3xl font-bold" style={{ color: "#3CFF7A" }}>
                      {project.launchReadiness}
                      <span className="text-base text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">
                      World hypothesis
                    </div>
                    <p className="mt-1 text-sm">
                      {report?.simulation_world.hypothesis ?? out.critic.improved}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">
                      Main failure mode
                    </div>
                    <p className="mt-1 text-sm">
                      {report?.outputs.critic.main_failure_mode ?? out.critic.risk}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">Next move</div>
                    <p className="mt-1 text-sm">
                      {report?.outputs.critic.fix_first?.[0] ?? out.critic.fix}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ResultLink to="/projects/$projectId/dashboard" projectId={project.id}>
                    Open overview
                  </ResultLink>
                  <ResultLink to="/projects/$projectId/marketing" projectId={project.id}>
                    Open go-to-market
                  </ResultLink>
                  <ResultLink to="/projects/$projectId/statistics" projectId={project.id}>
                    View insights
                  </ResultLink>
                </div>
              </motion.div>

              <OutputTabs
                data={out}
                ready={project.outputsReady}
                backendOutput={project.backendOutput}
                report={report as SimulationReport | undefined}
              />
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}

function CtrlBtn({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50"
      style={
        primary
          ? {
              background: "linear-gradient(135deg,#FF2D2D,#FF5A5A)",
              borderColor: "transparent",
              color: "white",
              boxShadow: "0 0 18px rgba(255,45,45,0.35)",
            }
          : { background: "#181818", borderColor: "#2A2A2A", color: "#F8F8F8" }
      }
    >
      {children}
    </button>
  );
}

function ResultLink({
  to,
  projectId,
  children,
}: {
  to:
    | "/projects/$projectId/dashboard"
    | "/projects/$projectId/marketing"
    | "/projects/$projectId/statistics";
  projectId: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      params={{ projectId }}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.5)]"
      style={{ background: "#181818", borderColor: "#2A2A2A" }}
    >
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
