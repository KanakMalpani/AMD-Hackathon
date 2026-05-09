import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, Cpu, FileText, Radar, Sparkles, Users } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/_app/projects/$projectId/dashboard")({
  head: () => ({ meta: [{ title: "Overview - Autonomous Startup-in-a-Box" }] }),
  component: ProjectDashboardPage,
});

function ProjectDashboardPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Workspace not found" />}>
        <div className="rounded-2xl border p-10 text-center" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <p className="text-sm text-muted-foreground">This workspace no longer exists.</p>
          <button onClick={() => navigate({ to: "/projects" })} className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
            Back to workspaces
          </button>
        </div>
      </AppLayout>
    );
  }

  const report = project.simulationReport;
  const prompt = project.prompt;
  const readiness = report?.readiness_score ?? project.launchReadiness;
  const agentCount = report?.agents.length ?? 6;

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Autonomous Startup-in-a-Box</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Startup World Overview</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A MiroFish-inspired control surface for your startup simulation: seed brief, agent cast, AMD runtime story, and final report.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NavButton to="/projects/$projectId/prompts" projectId={project.id} icon={<FileText className="h-4 w-4" />}>
            Edit brief
          </NavButton>
          <NavButton to="/projects/$projectId/simulation" projectId={project.id} icon={<Activity className="h-4 w-4" />}>
            Run simulation
          </NavButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Startup world score" value={`${readiness}/100`} hint="Launch readiness after simulation" icon={<Radar className="h-4 w-4 text-primary" />} />
        <MetricCard label="Agent cast" value={`${agentCount}`} hint="Specialist agents in the runtime" icon={<Users className="h-4 w-4 text-primary" />} />
        <MetricCard label="Runtime mode" value={project.outputsReady ? "Ready" : "Draft"} hint="AMD-backed simulation state" icon={<Cpu className="h-4 w-4 text-primary" />} />
        <MetricCard label="World seed" value={prompt?.seedContext ? "Loaded" : "Missing"} hint="Source context for the scenario" icon={<Sparkles className="h-4 w-4 text-primary" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <Panel title="Reality Seed Brief" eyebrow="Step 01">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Idea">{prompt?.idea || project.idea || "No idea captured yet."}</Field>
              <Field label="Audience">{prompt?.audience || "Audience not defined yet."}</Field>
              <Field label="Problem">{prompt?.problem || "Problem statement not defined yet."}</Field>
              <Field label="Simulation goal">{prompt?.simulationGoal || "Simulation goal not defined yet."}</Field>
              <Field label="Key signals">{prompt?.keySignals || "No signals captured yet."}</Field>
              <Field label="AMD focus">{prompt?.amdFocus || "AMD runtime framing not defined yet."}</Field>
            </div>
            <Field label="Seed context">{prompt?.seedContext || "No seed dossier yet. Add assumptions, notes, or market context in the brief step."}</Field>
          </Panel>

          <Panel title="Simulation World" eyebrow="Step 02">
            {report ? (
              <div className="space-y-4">
                <Field label="Executive summary">{report.executive_summary}</Field>
                <Field label="Hypothesis">{report.simulation_world.hypothesis}</Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Market forces">{report.simulation_world.market_forces.join(" | ")}</Field>
                  <Field label="Intervention levers">{report.simulation_world.intervention_levers.join(" | ")}</Field>
                </div>
              </div>
            ) : (
              <EmptyMessage text="Run the simulation to generate the world model, hypothesis, and market-force map." />
            )}
          </Panel>
        </section>

        <section className="space-y-6">
          <Panel title="Agent Cast" eyebrow="Step 03">
            {report ? (
              <div className="space-y-3">
                {report.agents.map((agent) => (
                  <div key={agent.name} className="rounded-xl border p-4" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
                    <div className="text-[10px] uppercase tracking-wider text-primary">{agent.role}</div>
                    <div className="mt-1 font-semibold">{agent.name}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{agent.goal}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMessage text="The agent cast will appear once the startup world is generated." />
            )}
          </Panel>

          <Panel title="AMD Runtime Story" eyebrow="Step 04">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Use AMD Instinct or Radeon-backed inference as a visible part of the demo, not just hidden infrastructure.</p>
              <ul className="space-y-2">
                <li>Show parallel agent execution as the differentiator.</li>
                <li>Frame fast simulation turnaround as an AMD compute advantage.</li>
                <li>Connect the final report quality to scalable, low-latency model serving.</li>
              </ul>
            </div>
          </Panel>

          <Panel title="Next Actions" eyebrow="Step 05">
            <div className="space-y-2">
              <ActionLink to="/projects/$projectId/prompts" projectId={project.id} label="Refine the reality seed brief" />
              <ActionLink to="/projects/$projectId/simulation" projectId={project.id} label="Run or re-run the startup world" />
              <ActionLink to="/projects/$projectId/marketing" projectId={project.id} label="Review the launch narrative" />
              <ActionLink to="/projects/$projectId/statistics" projectId={project.id} label="Inspect readiness and report signals" />
            </div>
          </Panel>
        </section>
      </div>
    </AppLayout>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-weak">{label}</div>
        {icon}
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
      <div className="text-[10px] uppercase tracking-wider text-weak">{eyebrow}</div>
      <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-weak">{label}</div>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <div className="rounded-xl border px-4 py-5 text-sm text-muted-foreground" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>{text}</div>;
}

function NavButton({
  to,
  projectId,
  icon,
  children,
}: {
  to: "/projects/$projectId/prompts" | "/projects/$projectId/simulation";
  projectId: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      params={{ projectId }}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]"
      style={{ background: "#181818", borderColor: "#2A2A2A" }}
    >
      {icon}
      {children}
    </Link>
  );
}

function ActionLink({
  to,
  projectId,
  label,
}: {
  to: "/projects/$projectId/prompts" | "/projects/$projectId/simulation" | "/projects/$projectId/marketing" | "/projects/$projectId/statistics";
  projectId: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      params={{ projectId }}
      className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors hover:border-[rgba(255,45,45,0.5)]"
      style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-primary" />
    </Link>
  );
}
