import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, FastForward, ArrowRight, PencilLine, Paperclip, Activity } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { ExecutionTimeline } from "@/components/dashboard/ExecutionTimeline";
import { AgentActivityFeed } from "@/components/dashboard/AgentActivityFeed";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { OutputTabs } from "@/components/dashboard/OutputTabs";
import { AMDComputePanel } from "@/components/dashboard/AMDComputePanel";
import { store, useStore, STAGE_TEMPLATE } from "@/lib/app-store";
import { buildOutputs, agentLinesFor } from "@/lib/mock-outputs";
import { toast } from "sonner";
import { generateStartup, getJobStatus } from "@/lib/api";

export const Route = createFileRoute("/_app/projects/$projectId/simulation")({
  head: () => ({ meta: [{ title: "Simulation — LaunchMyIdea" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ autostart: s.autostart ? 1 : undefined }),
  component: SimulationPage,
});

// Agent lines are sourced per-project via agentLinesFor(project.idea).

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
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <div className="rounded-2xl border p-10 text-center" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
            Back to startups
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
    if (!project) return;
    clearAll();
    store.resetSimulation(project.id);
    setElapsed(0);
    setPaused(false);
    setRunning(true);
    tick.current = window.setInterval(() => setElapsed((e) => e + 100), 100);

    const lines = agentLinesFor(project.idea);
    const total = STAGE_TEMPLATE.length;
    
    // 1. Trigger Backend
    let jobId = "";
    try {
      jobId = await generateStartup(project.idea || "New Startup Idea");
      toast.info("AMD Agents deployed.");
    } catch (err) {
      toast.error("Failed to connect to AMD compute.");
      setRunning(false);
      return;
    }

    // 2. Start Visual Simulation
    const stepMs = 1500; // Slower, more realistic
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
        store.setReadiness(project.id, Math.round(((i + 1) / total) * 60)); // Cap visual progress until backend is done
      }, i * stepMs);
      timers.current.push(t);
    }

    // 3. Poll Backend
    const pollInterval = window.setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        if (status.status === "completed" && status.output) {
          clearInterval(pollInterval);
          finishSimulation(status.output);
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          toast.error("Pipeline failed: " + status.error);
          setRunning(false);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);
    
    timers.current.push(pollInterval as unknown as number);
  }

  function finishSimulation(finalOutput: string) {
    if (!project) return;
    clearAll();
    const total = STAGE_TEMPLATE.length;
    store.completeStage(project.id, total - 1);
    store.setReadiness(project.id, 100);
    store.setBackendOutput(project.id, finalOutput);
    store.setOutputsReady(project.id, true);
    store.updateProject(project.id, { status: "Launch Ready" });
    setRunning(false);
    toast.success("AMD LLM finished. Launch package ready.");
  }


  function pause() {
    if (!running) return;
    setPaused((p) => !p);
    if (!paused) {
      clearAll();
      setRunning(false);
      toast("Simulation paused.");
    } else {
      // resume = restart from current stage (mock)
      start();
    }
  }

  function restart() {
    clearAll();
    setRunning(false);
    setPaused(false);
    setElapsed(0);
    store.resetSimulation(project!.id);
    toast("Simulation reset.");
  }

  function finish() {
    clearAll();
    const total = STAGE_TEMPLATE.length;
    store.completeStage(project!.id, total - 1);
    store.setReadiness(project!.id, 87);
    store.setOutputsReady(project!.id, true);
    store.updateProject(project!.id, { status: "Launch Ready" });
    const lines = agentLinesFor(project!.idea);
    lines.forEach((l, i) =>
      store.addActivity(project!.id, {
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
  const elapsedStr = `${Math.floor(elapsed / 1000)}.${String(Math.floor((elapsed % 1000) / 100))}s`;
  const completed = project.stages.filter((s) => s.status === "complete").length;
  const iter = Math.max(1, completed);

  const previewCards = [
    { key: "validation", title: "Validation", body: out.validation.differentiation, score: out.validation.score, ready: completed >= 2 },
    { key: "mvp", title: "MVP", body: out.mvp.firstVersion, score: 85, ready: completed >= 3 },
    { key: "landing", title: "Landing copy", body: out.landing.headline, score: 80, ready: completed >= 4 },
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
          description="The simulation runs your idea through every agent — validation, MVP, marketing, finance, and critic. Add a prompt on the dashboard first, then come back here to watch it execute."
          steps={[
            { icon: PencilLine, title: "Write your idea", description: "Open the dashboard and describe what you want to launch." },
            { icon: Paperclip, title: "Attach references", description: "Optional — drop briefs or notes to ground the agents." },
            { icon: Activity, title: "Run the simulation", description: "Watch agents collaborate live and score your launch." },
          ]}
          actions={[
            { label: "Open dashboard", to: "/projects/$projectId/dashboard", projectId: project.id, icon: PencilLine },
            { label: "Run anyway", onClick: start, variant: "ghost", icon: Play },
          ]}
        />
      ) : (
      <>
      <div className="mb-6">
        <AMDComputePanel active={running} />
      </div>

      {/* Hardware Drag Race */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {/* AMD Lane */}
        <div className="rounded-2xl border p-5" style={{ background: "rgba(255,45,45,0.05)", borderColor: "rgba(255,45,45,0.3)" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2">
              <span className="text-primary animate-pulse">●</span> AMD Instinct™ / ROCm
            </h3>
            <span className="font-mono text-xs text-primary">{Math.min(100, project.readiness)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.readiness}%` }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#FF2D2D,#FF5A5A)" }}
            />
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground flex justify-between">
            <span>Tokens/sec: {running ? "142.5" : "0.0"}</span>
            <span>Status: {project.outputsReady ? "Complete" : running ? "Parallel Inference" : "Idle"}</span>
          </div>
        </div>

        {/* CPU Lane */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <span className="text-gray-500">●</span> Standard Cloud CPU
            </h3>
            <span className="font-mono text-xs text-muted-foreground">{running || project.outputsReady ? Math.min(100, Math.floor((elapsed / 1000) * 2.5)) : 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${running || project.outputsReady ? Math.min(100, Math.floor((elapsed / 1000) * 2.5)) : 0}%` }}
              className="h-full rounded-full bg-gray-500"
            />
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground flex justify-between">
            <span>Tokens/sec: {running ? "12.1" : "0.0"}</span>
            <span>Status: {running && elapsed < 40000 ? "Throttling..." : project.outputsReady ? "Struggling..." : "Idle"}</span>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
        style={{ background: "#111", borderColor: "#2A2A2A" }}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-weak">Status</div>
            <div className="font-semibold">
              {running ? (
                <span className="text-primary">Running…</span>
              ) : paused ? (
                <span style={{ color: "#FF8585" }}>Paused</span>
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
            <div className="text-[10px] uppercase tracking-wider text-weak">Iteration</div>
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
        {/* Timeline */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Simulation timeline</h3>
          <ExecutionTimeline stages={project.stages} />
        </div>
        {/* Live feed */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Live execution feed</h3>
          <AgentActivityFeed messages={project.activity} />
        </div>
        {/* Output preview */}
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Generated output</h3>
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
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{c.body}</p>
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

      {/* Results */}
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
                <div className="text-[10px] uppercase tracking-wider text-weak">Launch readiness</div>
                <div className="mt-1 font-display text-3xl font-bold" style={{ color: "#3CFF7A" }}>
                  {project.launchReadiness}<span className="text-base text-muted-foreground">/100</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Biggest opportunity</div>
                <p className="mt-1 text-sm">{out.critic.improved}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Biggest risk</div>
                <p className="mt-1 text-sm">{out.critic.risk}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-weak">Next step</div>
                <p className="mt-1 text-sm">{out.critic.fix}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <ResultLink to="/projects/$projectId/dashboard" projectId={project.id}>View dashboard</ResultLink>
              <ResultLink to="/projects/$projectId/marketing" projectId={project.id}>Open marketing</ResultLink>
              <ResultLink to="/projects/$projectId/statistics" projectId={project.id}>View statistics</ResultLink>
            </div>
          </motion.div>

          <OutputTabs data={out} ready={project.outputsReady} backendOutput={project.backendOutput} />
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
