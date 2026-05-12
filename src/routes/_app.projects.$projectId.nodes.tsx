import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, Network, Sparkles } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { SimulationNodeGraph } from "@/components/dashboard/SimulationNodeGraph";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/_app/projects/$projectId/nodes")({
  head: () => ({ meta: [{ title: "Nodes - LaunchMyIdea AI" }] }),
  component: NodesPage,
});

function NodesPage() {
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

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">LaunchMyIdea AI</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Simulation Nodes</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            View the simulation as connected nodes: workflow stages on the left and specialist agent outputs on the right.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink to="/projects/$projectId/prompts" projectId={project.id} icon={<Sparkles className="h-4 w-4" />}>
            Edit Brief
          </QuickLink>
          <QuickLink to="/projects/$projectId/simulation" projectId={project.id} icon={<Activity className="h-4 w-4" />}>
            Open Simulation
          </QuickLink>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <SimulationNodeGraph
          stages={project.stages}
          agents={project.simulationReport?.agents}
          activity={project.activity}
          stageInsights={project.simulationReport?.node_insights}
          agentFindings={project.simulationReport?.agent_findings}
        />

        <div className="space-y-4">
          <Panel title="How to read it" icon={<Network className="h-4 w-4 text-primary" />}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Left side nodes are the simulation stages, now annotated with idea-specific research insights.</li>
              <li>Right side nodes are the agents, each showing the key finding they contributed.</li>
              <li>Green means finished, red means live, gray means waiting.</li>
            </ul>
          </Panel>
          <Panel title="Best demo flow" icon={<ArrowRight className="h-4 w-4 text-primary" />}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Start on the Brief page.</li>
              <li>Run the Simulation page.</li>
              <li>Open this Nodes page to show the research-to-execution flow visually.</li>
              <li>Finish with Outputs and Live Preview.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Nodes active" value={`${project.stages.length + (project.simulationReport?.agents.length ?? 0)}`} />
        <SummaryCard label="Activity events" value={`${project.activity.length}`} />
        <SummaryCard label="Readiness" value={`${project.simulationReport?.readiness_score ?? project.launchReadiness}/100`} />
      </div>

      {project.simulationReport?.research.sources?.length ? (
        <Panel title="Grounding Sources" icon={<Sparkles className="h-4 w-4 text-primary" />}>
          <div className="grid gap-3 md:grid-cols-2">
            {project.simulationReport.research.sources.slice(0, 4).map((source) => (
              <a
                key={source.url || source.title}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border p-4 text-sm transition-colors hover:border-[rgba(255,45,45,0.5)]"
                style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
              >
                <div className="font-semibold">{source.title}</div>
                <p className="mt-2 text-xs text-muted-foreground">{source.note}</p>
              </a>
            ))}
          </div>
        </Panel>
      ) : null}
    </AppLayout>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
      <div className="text-[10px] uppercase tracking-wider text-weak">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function QuickLink({
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
