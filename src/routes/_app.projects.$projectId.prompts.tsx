import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Save, Wand2, RotateCcw, Play } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { store, useStore, ideaToTitle, type PromptData } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/prompts")({
  head: () => ({ meta: [{ title: "Prompt — LaunchMyIdea" }] }),
  component: PromptsPage,
});

const TEMPLATES: { name: string; data: PromptData }[] = [
  {
    name: "Student SaaS",
    data: {
      idea: "AI study planner for students preparing for exams",
      audience: "Students aged 15-24 preparing for competitive exams",
      problem: "Students struggle with consistent planning, revision, and progress tracking",
      businessModel: "Freemium with premium plans",
      mvpScope: "Study planner, daily checklist, progress tracker, weak-topic detection",
      tone: "Friendly, motivating, student-first",
      constraints: "Must work on mobile, must feel lightweight, no heavy onboarding",
    },
  },
  {
    name: "AI Fitness Coach",
    data: {
      idea: "AI fitness coach for beginners",
      audience: "Beginners starting fitness journeys aged 20-35",
      problem: "Beginners get confused by random workouts, diets, and inconsistent progress",
      businessModel: "Subscription with free trial",
      mvpScope: "Workout planner, diet suggestions, progress tracker, habit reminders",
      tone: "Encouraging, beginner-friendly, no-judgement",
      constraints: "No gym equipment assumed, mobile-first, short workouts",
    },
  },
  {
    name: "Creator Tool",
    data: {
      idea: "AI content planner for solo creators",
      audience: "Indie creators across YouTube, X, Instagram",
      problem: "Creators struggle with consistency, ideas, and distribution",
      businessModel: "Freemium with creator pro plan",
      mvpScope: "Idea generator, content calendar, hook generator, caption writer",
      tone: "Sharp, witty, creator-native",
      constraints: "Generate in under 10 seconds, voice-aware, exportable",
    },
  },
  {
    name: "Local Business App",
    data: {
      idea: "AI assistant for local small businesses",
      audience: "Solo owners of local stores, salons, cafes",
      problem: "Small businesses can't afford marketers or planners",
      businessModel: "Low monthly fee per location",
      mvpScope: "Local promo planner, social posts, customer reminders",
      tone: "Practical, no-jargon, supportive",
      constraints: "Works in poor connectivity, multilingual",
    },
  },
  {
    name: "Productivity App",
    data: {
      idea: "AI productivity co-pilot for solo builders",
      audience: "Indie founders and solo developers",
      problem: "Builders waste hours context-switching and planning",
      businessModel: "Pro subscription",
      mvpScope: "Daily plan, focus blocks, weekly review, integrations",
      tone: "Calm, focused, builder-grade",
      constraints: "Keyboard-first, fast, no bloat",
    },
  },
  {
    name: "Developer Tool",
    data: {
      idea: "AI tool that explains and fixes legacy code",
      audience: "Mid-level engineers maintaining legacy codebases",
      problem: "Onboarding to legacy code is slow and painful",
      businessModel: "Per-seat subscription",
      mvpScope: "Code explanation, refactor suggestions, dependency map",
      tone: "Technical, precise, no fluff",
      constraints: "Works offline on private repos, fast indexing",
    },
  },
];

const EMPTY: PromptData = {
  idea: "",
  audience: "",
  problem: "",
  businessModel: "",
  mvpScope: "",
  tone: "",
  constraints: "",
};

function PromptsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [data, setData] = useState<PromptData>(project?.prompt ?? { ...EMPTY, idea: project?.idea ?? "" });

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
          Back to startups
        </button>
      </AppLayout>
    );
  }

  function update<K extends keyof PromptData>(k: K, v: PromptData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function applyTemplate(t: PromptData) {
    setData(t);
    toast.success("Template loaded.");
  }

  function savePrompt() {
    store.updateProject(project!.id, { prompt: data, idea: data.idea, title: data.idea ? ideaToTitle(data.idea) : project!.title });
    toast.success("Prompt saved.");
  }

  function improvePrompt() {
    setData((d) => ({
      ...d,
      idea: d.idea ? `${d.idea} — refined with a sharper wedge and clearer ICP.` : d.idea,
      problem: d.problem || "Users waste hours and lack a clear next step.",
      tone: d.tone || "Bold, founder-grade, no fluff",
    }));
    toast.success("Improved by Critic Engine.");
  }

  function generate() {
    savePrompt();
    navigate({ to: "/projects/$projectId/simulation", params: { projectId: project!.id }, search: { autostart: 1 } });
  }

  function reset() {
    setData({ ...EMPTY });
    toast("Prompt cleared.");
  }

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Setup</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Prompt</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={improvePrompt} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <Wand2 className="h-3.5 w-3.5 text-primary" /> Improve prompt
          </button>
          <button onClick={savePrompt} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.4)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <Save className="h-3.5 w-3.5" /> Save prompt
          </button>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={generate} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D", boxShadow: "0 0 18px rgba(255,45,45,0.35)" }}>
            <Play className="h-3.5 w-3.5" /> Generate launch package
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2 rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <Field label="Startup idea">
            <textarea value={data.idea} onChange={(e) => update("idea", e.target.value)} className="min-h-[100px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]" style={{ borderColor: "#2A2A2A" }} placeholder="Describe what you want to build…" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Target audience"><Input value={data.audience} onChange={(v) => update("audience", v)} /></Field>
            <Field label="Problem statement"><Input value={data.problem} onChange={(v) => update("problem", v)} /></Field>
            <Field label="Business model"><Input value={data.businessModel} onChange={(v) => update("businessModel", v)} /></Field>
            <Field label="MVP scope"><Input value={data.mvpScope} onChange={(v) => update("mvpScope", v)} /></Field>
            <Field label="Tone"><Input value={data.tone} onChange={(v) => update("tone", v)} /></Field>
            <Field label="Constraints"><Input value={data.constraints} onChange={(v) => update("constraints", v)} /></Field>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">Templates</h3>
          </div>
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <motion.button
                key={t.name}
                whileHover={{ x: 2 }}
                onClick={() => applyTemplate(t.data)}
                className="block w-full rounded-lg border p-3 text-left text-xs transition-colors hover:border-[rgba(255,45,45,0.5)]"
                style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
              >
                <div className="font-semibold">{t.name}</div>
                <div className="mt-1 line-clamp-2 text-muted-foreground">{t.data.idea}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
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

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border bg-[#0c0c0e] px-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]" style={{ borderColor: "#2A2A2A" }} />
  );
}
