import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Megaphone, BarChart3, Rocket, MessageSquare } from "lucide-react";
import { useStore } from "@/lib/app-store";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

export const Route = createFileRoute("/_app/projects/$projectId/dashboard")({
  head: () => ({ meta: [{ title: "Workspace — LaunchMyIdea" }] }),
  component: ProjectDashboardPage,
});

type View = "chat" | "marketing" | "analytics";

function ProjectDashboardPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [view, setView] = useState<View>("chat");
  const [chatSent, setChatSent] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#070707" }}>
        <div className="rounded-2xl border p-10 text-center" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <p className="text-sm text-muted-foreground">This project no longer exists.</p>
          <button onClick={() => navigate({ to: "/projects" })} className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>Back to startups</button>
        </div>
      </div>
    );
  }

  const items: { key: View; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "chat", label: "Chat", Icon: MessageSquare },
    { key: "marketing", label: "Launch Plan", Icon: Megaphone },
    { key: "analytics", label: "Insights", Icon: BarChart3 },
  ];

  const chatMaximized = view === "chat" && chatSent;

  return (
    <div className="min-h-screen flex">
      {!chatMaximized && (
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r md:flex"
        style={{ borderColor: "#2A2A2A", background: "rgba(10,10,12,0.85)", backdropFilter: "blur(14px)" }}
      >
        <Link to="/" className="flex items-center gap-2 px-5 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "#FF2D2D" }}>
            <Rocket className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            LaunchMyIdea<span className="text-primary"> AI</span>
          </span>
        </Link>

        <div className="px-5 pb-3">
          <div className="text-[10px] uppercase tracking-wider text-weak">Startup</div>
          <div className="truncate text-sm font-semibold">{project.title}</div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {items.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => { setView(key); if (key !== "chat") setChatSent(false); }}
                className={
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
                  (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                }
                style={
                  active
                    ? { background: "rgba(255,45,45,0.10)", boxShadow: "inset 2px 0 0 #FF2D2D, 0 0 24px rgba(255,45,45,0.15)" }
                    : undefined
                }
              >
                <Icon className={"h-4 w-4 " + (active ? "text-primary" : "")} />
                {label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => navigate({ to: "/projects" })}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-[rgba(255,45,45,0.08)] hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </aside>
      )}

      <div className={"flex-1 " + (chatMaximized ? "" : "md:pl-64")}>
        {!chatMaximized && (
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6"
          style={{ borderColor: "#2A2A2A", background: "rgba(8,8,8,0.75)", backdropFilter: "blur(14px)" }}
        >
          <h1 className="font-display text-lg font-semibold tracking-tight capitalize">{view}</h1>
          <button
            onClick={() => navigate({ to: "/projects" })}
            className="md:hidden inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]"
            style={{ background: "#181818", borderColor: "#2A2A2A" }}
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            Go Back
          </button>
        </header>
        )}

        {chatMaximized ? (
          <div className="fixed inset-0 z-50 flex" style={{ background: "#070707" }}>
            <div className="flex-1 relative">
              <button
                onClick={() => setChatSent(false)}
                className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]"
                style={{ background: "#181818", borderColor: "#2A2A2A" }}
              >
                <ArrowLeft className="h-3.5 w-3.5 text-primary" />
                Back
              </button>
            </div>
            <aside
              className="w-80 border-l flex flex-col"
              style={{ borderColor: "#2A2A2A", background: "rgba(10,10,12,0.85)", backdropFilter: "blur(14px)" }}
            >
              <AnimatedAIChat compact onSubmit={() => setChatSent(true)} />
            </aside>
          </div>
        ) : (
          <main className="px-6 py-10">
            {view === "chat" ? (
              <AnimatedAIChat onSubmit={() => setChatSent(true)} />
            ) : (
              <div
                className="rounded-2xl border p-16 text-center"
                style={{ background: "#111111", borderColor: "#2A2A2A" }}
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "rgba(255,45,45,0.12)" }}>
                  {view === "marketing" ? (
                    <Megaphone className="h-6 w-6 text-primary" />
                  ) : (
                    <BarChart3 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold capitalize">{view}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This space is intentionally blank for now.
                </p>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
