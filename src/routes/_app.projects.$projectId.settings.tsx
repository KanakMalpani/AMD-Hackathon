import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, Save, X } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { store, useStore } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/settings")({
  head: () => ({ meta: [{ title: "Startup Settings — LaunchMyIdea AI" }] }),
  component: ProjectSettingsPage,
});

function ProjectSettingsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [title, setTitle] = useState(project?.title ?? "");
  const [idea, setIdea] = useState(project?.idea ?? "");
  const [confirm, setConfirm] = useState(false);
  const [depth, setDepth] = useState(project?.simSettings?.depth ?? "Balanced");
  const [strict, setStrict] = useState(project?.simSettings?.strictness ?? "Normal");
  const [format, setFormat] = useState<"PDF" | "Markdown" | "JSON">("PDF");

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
          Back to startups
        </button>
      </AppLayout>
    );
  }

  function save() {
    store.updateProject(project!.id, {
      title,
      idea,
      simSettings: {
        ...(project!.simSettings ?? {
          outputs: ["Full Launch Package"],
          includeAMD: true,
          includeCritic: true,
          includeCode: true,
        }),
        depth: depth as "Fast" | "Balanced" | "Deep",
        strictness: strict as "Soft" | "Normal" | "Brutal",
      },
    });
    toast.success("Startup settings saved.");
  }

  function reset() {
    store.resetSimulation(project!.id);
    toast("Startup data reset.");
  }

  function del() {
    store.deleteProject(project!.id);
    toast.success("Startup deleted.");
    navigate({ to: "/projects" });
  }

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-weak">Configuration</div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Startup settings</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Startup info</h3>
          <div className="space-y-3 text-xs">
            <Field label="Startup name">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 w-full rounded-lg border bg-[#0c0c0e] px-3 outline-none focus:border-[rgba(255,45,45,0.5)]" style={{ borderColor: "#2A2A2A" }} />
            </Field>
            <Field label="Startup idea">
              <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="min-h-[100px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 outline-none focus:border-[rgba(255,45,45,0.5)]" style={{ borderColor: "#2A2A2A" }} />
            </Field>
            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
              <Info label="Status" value={project.status} />
              <Info label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
            </div>
            <button onClick={save} className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
              <Save className="h-3.5 w-3.5" /> Save changes
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <h3 className="mb-4 font-display text-sm font-semibold">Simulation preferences</h3>
          <div className="space-y-3 text-xs">
            <Field label="Default simulation depth">
              <Seg value={depth} options={["Fast", "Balanced", "Deep"]} onChange={(v) => setDepth(v as typeof depth)} />
            </Field>
            <Field label="Critic strictness">
              <Seg value={strict} options={["Soft", "Normal", "Brutal"]} onChange={(v) => setStrict(v as typeof strict)} />
            </Field>
            <Field label="Preferred output format">
              <Seg value={format} options={["PDF", "Markdown", "JSON"]} onChange={(v) => setFormat(v as typeof format)} />
            </Field>
            <button onClick={save} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.4)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
              <Save className="h-3.5 w-3.5" /> Save preferences
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div
        className="mt-6 rounded-2xl border p-5"
        style={{
          background: "linear-gradient(135deg,#111 0%, rgba(255,45,45,0.06) 100%)",
          borderColor: "rgba(255,45,45,0.4)",
        }}
      >
        <h3 className="mb-3 font-display text-sm font-semibold" style={{ color: "#FF8585" }}>
          Danger zone
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={reset}
            className="flex items-center justify-between rounded-xl border p-4 text-left transition-colors hover:border-[rgba(255,45,45,0.5)]"
            style={{ background: "#181818", borderColor: "#2A2A2A" }}
          >
            <div>
              <div className="text-sm font-semibold">Reset project demo data</div>
              <div className="text-xs text-muted-foreground">Clear simulation state, score, and activity for this project.</div>
            </div>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setConfirm(true)}
            className="flex items-center justify-between rounded-xl border p-4 text-left transition-colors hover:border-[rgba(255,45,45,0.5)]"
            style={{ background: "#181818", borderColor: "#2A2A2A" }}
          >
            <div>
              <div className="text-sm font-semibold">Delete startup</div>
              <div className="text-xs text-muted-foreground">Permanently remove this project and its outputs.</div>
            </div>
            <Trash2 className="h-4 w-4" style={{ color: "#FF8585" }} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur" onClick={() => setConfirm(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#111", borderColor: "rgba(255,45,45,0.4)" }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Delete this startup?</h3>
                <button onClick={() => setConfirm(false)} className="text-weak hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-muted-foreground">
                "{project.title}" and all its mock outputs will be permanently removed.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setConfirm(false)} className="rounded-lg border px-3 py-2 text-xs" style={{ background: "#181818", borderColor: "#2A2A2A" }}>Cancel</button>
                <button onClick={del} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>Delete startup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-weak">{label}</div>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-2.5" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
      <div className="text-[10px] uppercase tracking-wider text-weak">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}

function Seg({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex w-full overflow-hidden rounded-lg border" style={{ borderColor: "#2A2A2A", background: "#0c0c0e" }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} className="flex-1 px-3 py-2 transition-colors" style={{ background: on ? "rgba(255,45,45,0.14)" : "transparent", color: on ? "#FF8585" : "#A1A1AA" }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
