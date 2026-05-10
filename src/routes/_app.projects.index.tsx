import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Rocket, Search, Plus, ArrowRight, X } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { store, useStore, type Project } from "@/lib/app-store";

export const Route = createFileRoute("/_app/projects/")({
  head: () => ({ meta: [{ title: "Startups - LaunchMyIdea AI" }] }),
  component: ProjectsPage,
});

const FILTERS = ["All", "Simulating", "Needs Review", "Launch Ready", "Draft"] as const;
type Filter = (typeof FILTERS)[number];

function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [naming, setNaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const navigate = useNavigate();

  const filtered = projects
    .filter((p) => (filter === "All" ? true : p.status === filter))
    .filter((p) =>
      q.trim() ? (p.title + " " + p.idea).toLowerCase().includes(q.toLowerCase()) : true,
    );

  function openNew() {
    setNameDraft("");
    setNaming(true);
  }

  function createWith(title?: string) {
    const p = store.createProject("");
    const finalTitle = title?.trim() ? title.trim() : "Untitled Startup";
    store.updateProject(p.id, { title: finalTitle });
    setNaming(false);
    navigate({ to: "/projects/$projectId/dashboard", params: { projectId: p.id } });
  }

  return (
    <AppLayout topbar={<Topbar title="Your Startup Worlds" />}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Your Startup Worlds</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every idea from rough concept to a full multi-agent company simulation.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "#FF2D2D", boxShadow: "0 0 24px rgba(255,45,45,0.35)" }}
        >
          <Plus className="h-4 w-4" />
          New Workspace
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-weak" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search startup worlds..."
            className="h-10 w-full rounded-lg border bg-[#0d0d0f] pl-9 pr-3 text-sm text-foreground placeholder:text-weak outline-none focus:border-[rgba(255,45,45,0.5)]"
            style={{ borderColor: "#2A2A2A" }}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                background: filter === f ? "rgba(255,45,45,0.12)" : "#181818",
                borderColor: filter === f ? "rgba(255,45,45,0.5)" : "#2A2A2A",
                color: filter === f ? "#FF8585" : "#A1A1AA",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onCreate={openNew} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {naming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => setNaming(false)}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border p-6"
              style={{
                background: "#111111",
                borderColor: "#2A2A2A",
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">Name your startup</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Give it a memorable name, or skip and leave it untitled.
                  </p>
                </div>
                <button onClick={() => setNaming(false)} className="text-weak hover:text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createWith(nameDraft);
                }}
                placeholder="e.g. Founder copilot for student teams"
                className="mt-5 h-11 w-full rounded-lg border bg-[#0d0d0f] px-3 text-sm text-foreground placeholder:text-weak outline-none focus:border-[rgba(255,45,45,0.5)]"
                style={{ borderColor: "#2A2A2A" }}
              />

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => createWith()}
                  className="rounded-lg border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-[rgba(255,45,45,0.5)] hover:text-foreground"
                  style={{ background: "#181818", borderColor: "#2A2A2A" }}
                >
                  Leave untitled
                </button>
                <button
                  onClick={() => createWith(nameDraft)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                  style={{ background: "#FF2D2D", boxShadow: "0 0 18px rgba(255,45,45,0.35)" }}
                >
                  Create startup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isReady = project.status === "Launch Ready";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border p-5 transition-all hover:border-[rgba(255,45,45,0.5)] hover:shadow-[0_0_32px_rgba(255,45,45,0.18)]"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold">{project.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {project.idea || "No idea yet - open the dashboard to add one."}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
          style={{
            background: isReady ? "rgba(60,255,122,0.12)" : "rgba(255,45,45,0.10)",
            color: isReady ? "#3CFF7A" : "#FF8585",
            border: `1px solid ${isReady ? "rgba(60,255,122,0.4)" : "rgba(255,45,45,0.4)"}`,
          }}
        >
          {project.status}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-weak">
          <span>Simulation readiness</span>
          <span>{project.launchReadiness}/100</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1a1c]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.launchReadiness}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{
              background: isReady
                ? "linear-gradient(90deg,#FF2D2D,#3CFF7A)"
                : "linear-gradient(90deg,#FF2D2D,#FF8585)",
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[11px] text-weak">{new Date(project.createdAt).toLocaleDateString()}</span>
        <Link
          to="/projects/$projectId/dashboard"
          params={{ projectId: project.id }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5"
        >
          Open Workspace <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border px-6 py-20 text-center"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: "rgba(255,45,45,0.12)" }}
      >
        <Rocket className="h-6 w-6 text-primary" />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold">Start with one idea.</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first startup workspace and turn a rough concept into a visible company
        simulation.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "#FF2D2D", boxShadow: "0 0 24px rgba(255,45,45,0.35)" }}
      >
        <Plus className="h-4 w-4" />
        New Workspace
      </button>
    </div>
  );
}
