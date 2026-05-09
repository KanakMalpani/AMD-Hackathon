import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Cpu, FastForward, PencilLine, Play, RotateCcw, Pause, Paperclip } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { ExecutionTimeline } from "@/components/dashboard/ExecutionTimeline";
import { AgentActivityFeed } from "@/components/dashboard/AgentActivityFeed";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OutputTabs } from "@/components/dashboard/OutputTabs";
import { AMDComputePanel } from "@/components/dashboard/AMDComputePanel";
import { store, useStore, STAGE_TEMPLATE, type PromptData, type SimulationReport } from "@/lib/app-store";
import { agentLinesFor, buildOutputs } from "@/lib/mock-outputs";
import { generateStartup, getJobStatus } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/simulation")({
  head: () => ({ meta: [{ title: "Simulation - Autonomous Startup-in-a-Box" }] }),
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

function SimulationPage() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch() as { autostart?: number };
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);
  const tick = useRef<number | null>(null);
  const startedFromAutostart = useRef(false);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    if (tick.current) clearInterval(tick.current);
  }, []);

  useEffect(() => {
    if (search.autostart && project && !startedFromAutostart.current) {
      startedFromAutostart.current = true;
      setTimeout(() => start(), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Workspace not found" />}>
        <div className="rounded-2xl border p-10 text-center" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
            Back to workspaces
          </button>
        </div>
      </AppLayout>
    );
  }

  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }

  async function start() {
    clearAll();
    store.resetSimulation(project.id);
    setElapsed(0);
    setPaused(false);
    setRunning(true);
    tick.current = window.setInterval(() => setElapsed((e) => e + 100), 100);

    const lines = agentLinesFor(project.idea);
    const total = STAGE_TEMPLATE.length;
    const prompt = project.prompt ?? fallbackPromptFromProject(project);

    let jobId = "";
    try {
      const response = await generateStartup(prompt);
      jobId = response.job_id;
      toast.info(response.runtime?.mock_mode ? "Mock runtime started." : "AMD runtime engaged.");
    } catch (err) {
      toast.error("Failed to connect to the simulation backend.");
      setRunning(false);
      return;
    }

    const stepMs = 1500;
    for (let i = 0; i < total - 1; i++) {
      const t = window.setTimeout(() => {
        store.advanceStage(project.id, i);
        if (i < lines.length) {
          const l = lines[i];
          store.addActivity(project.id, {
            id: `m_${Date.now()}_${i}`,
            agent: l.agent,
            text: l.text,
            ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            done: l.done,
          });
        }
        store.setReadiness(project.id, Math.round(((i + 1) / total) * 64));
      }, i * stepMs);
      timers.current.push(t);
    }

    const pollInterval = window.setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        if (status.status === "completed" && status.output) {
          clearInterval(pollInterval);
          finishSimulation(status.output, status.report);
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          toast.error("Simulation failed: " + status.error);
          setRunning(false);
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 2000);

    timers.current.push(pollInterval as unknown as number);
  }

  function finishSimulation(finalOutput: string, report?: SimulationReport) {
    clearAll();
    const total = STAGE_TEMPLATE.length;
    store.completeStage(project.id, total - 1);
    if (report) {
      store.setSimulationReport(project.id, report);
      store.setReadiness(project.id, report.readiness_score);
    } else {
      store.setReadiness(project.id, 90);
    }
    store.setBackendOutput(project.id, finalOutput);
    store.setOutputsReady(project.id, true);
    store.updateProject(project.id, { status: "Launch Ready" });
    setRunning(false);
    toast.success("Startup world simulation complete.");
  }

  function pause() {
    if (!running) return;
    setPaused((p) => !p);
    if (!paused) {
      clearAll();
      setRunning(false);
      toast("Simulation paused.");
    } else {
      start();
    }
  }

  function restart() {
    clearAll();
    setRunning(false);
    setPaused(false);
    setElapsed(0);
    store.resetSimulation(project.id);
    toast("Simulation reset.");
  }

  function finish() {
    clearAll();
    const total = STAGE_TEMPLATE.length;
    store.completeStage(project.id, total - 1);
    store.setReadiness(project.id, 86);
    store.setOutputsReady(project.id, true);
    store.updateProject(project.id, { status: "Launch Ready" });
    const lines = agentLinesFor(project.idea);
    lines.forEach((l, i) =>
      store.addActivity(project.id, {
        id: `mf_${Date.now()}_${i}`,
        agent: l.agent,
        text: l.text,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        done: l.done,
      }),
    );
    setRunning(false);
    toast.success("Simulation force-completed.");
  }

  const out = buildOutputs(project);
  const report = project.simulationReport;
  const elapsedStr = `${Math.floor(elapsed / 1000)}.${String(Math.floor((elapsed % 1000) / 100))}s`;
  const completed = project.stages.filter((s) => s.status === "complete").length;
  const iter = Math.max(1, completed);

  const previewCards = report
    ? [
        { key: "hypothesis", title: "World Hypothesis", body: report.simulation_world.hypothesis, score: report.readiness_score, ready: true },
        { key: "north", title: "North Star", body: report.outputs.product.north_star, score: report.readiness_score - 4, ready: true },
        { key: "narrative", title: "Launch Narrative", body: report.outputs.marketing.narrative, score: report.readiness_score - 6, ready: true },
        { key: "pricing", title: "Pricing", body: report.outputs.finance.pricing, score: report.readiness_score - 10, ready: true },
        { key: "critic", title: "Critic", body: report.outputs.critic.main_failure_mode, score: report.readiness_score - 8, ready: true },
      ]
    : [
        { key: "validation", title: "Validation", body: out.validation.differentiation, score: out.validation.score, ready: completed >= 2 },
        { key: "mvp", title: "MVP", body: out.mvp.firstVersion, score: 85, ready: completed >= 3 },
        { key: "landing", title: "Launch Narrative", body: out.marketing.icp, score: 80, ready: completed >= 4 },
        { key: "growth", title: "Growth", body: out.growth.summary, score: 78, ready: completed >= 7 },
        { key: "critic", title: "Critic", body: out.critic.weakest, score: 69, ready: completed >= 8 },
      ];

  const isEmpty = !project.idea?.trim() && !running && !paused && project.activity.length === 0 && !project.outputsReady;

  return (
    <AppLayout topbar={<Topbar project={project} onRunSimulation={start} />}>
      {isEmpty ? (
        <EmptyState
          eyebrow="Simulation"
          title="Nothing to simulate yet."
          description="The simulation runs your idea through a staged startup world: reality seed, strategy, agent cast, build plan, launch motion, and critic loop."
          steps={[
            { icon: PencilLine, title: "Write your brief", description: "Open the brief page and define the world seed." },
            { icon: Paperclip, title: "Add source signals", description: "Ground the simulation with constraints, signals, and AMD focus." },
            { icon: Activity, title: "Run the startup world", description: "Watch the agents build and challenge the company in real time." },
          ]}
          actions={[
            { label: "Open brief", to: "/projects/$projectId/prompts", projectId: project.id, icon: PencilLine },
            { label: "Run anyway", onClick: start, variant: "ghost", icon: Play },
          ]}
        />
      ) : (
        <>
          <div className="mb-6">
            <AMDComputePanel active={running} />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-5" style={{ background: "rgba(255,45,45,0.05)", borderColor: "rgba(255,45,45,0.3)" }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold flex items-center gap-2">
                  <span className="text-primary animate-pulse">●</span> AMD Multi-Agent Runtime
                </h3>
                <span className="font-mono text-xs text-primary">{Math.min(100, project.launchReadiness)}%</span>
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
                <span>Tokens/sec: {running ? "142.5" : "0.0"}</span>
                <span>Status: {project.outputsReady ? "Report ready" : running ? "Concurrent inference" : "Idle"}</span>
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Cpu className="h-4 w-4 text-primary" /> Startup World Score
                </h3>
                <span className="font-mono text-xs text-muted-foreground">{report?.readiness_score ?? project.launchReadiness}/100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report?.executive_summary ?? "Waiting for the report layer to synthesize the final company simulation."}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4" style={{ background: "#111", borderColor: "#2A2A2A" }}>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Status</div>
                <div className="font-semibold">
                  {running ? <span className="text-primary">Running...</span> : paused ? <span style={{ color: "#FF8585" }}>Paused</span> : project.outputsReady ? <span style={{ color: "#3CFF7A" }}>Complete</span> : <span className="text-muted-foreground">Idle</span>}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Elapsed</div>
                <div className="font-mono font-semibold">{elapsedStr}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Stage</div>
                <div className="font-semibold">{iter}/{STAGE_TEMPLATE.length}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CtrlBtn onClick={start} primary disabled={running}>
                <Play className="h-3.5 w-3.5" /> Start
              </CtrlBtn>
              <CtrlBtn onClick={pause} disabled={!running && !paused}>
                <Pause className="h-3.5 w-3.5" /> {paused ? "Resume" : "Pause"}
              </CtrlBtn>
              <CtrlBtn onClick={restart}>
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </CtrlBtn>
              <CtrlBtn onClick={finish}>
                <FastForward className="h-3.5 w-3.5" /> Finish
              </CtrlBtn>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
              <h3 className="mb-4 font-display text-sm font-semibold">Simulation timeline</h3>
              <ExecutionTimeline stages={project.stages} />
            </div>
            <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
              <h3 className="mb-4 font-display text-sm font-semibold">Agent activity feed</h3>
              <AgentActivityFeed messages={project.activity} />
            </div>
            <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
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
                style={{ background: "linear-gradient(135deg,#111 0%, rgba(60,255,122,0.05) 100%)", borderColor: "rgba(60,255,122,0.4)" }}
              >
                <div className="grid gap-6 sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">Startup world score</div>
                    <div className="mt-1 font-display text-3xl font-bold" style={{ color: "#3CFF7A" }}>
                      {project.launchReadiness}<span className="text-base text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">World hypothesis</div>
                    <p className="mt-1 text-sm">{report?.simulation_world.hypothesis ?? out.critic.improved}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">Main failure mode</div>
                    <p className="mt-1 text-sm">{report?.outputs.critic.main_failure_mode ?? out.critic.risk}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-weak">Next move</div>
                    <p className="mt-1 text-sm">{report?.outputs.critic.fix_first?.[0] ?? out.critic.fix}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ResultLink to="/projects/$projectId/dashboard" projectId={project.id}>Open overview</ResultLink>
                  <ResultLink to="/projects/$projectId/marketing" projectId={project.id}>Open launch plan</ResultLink>
                  <ResultLink to="/projects/$projectId/statistics" projectId={project.id}>View insights</ResultLink>
                </div>
              </motion.div>

              <OutputTabs data={out} ready={project.outputsReady} backendOutput={project.backendOutput} report={report} />
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
  to: "/projects/$projectId/dashboard" | "/projects/$projectId/marketing" | "/projects/$projectId/statistics";
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
