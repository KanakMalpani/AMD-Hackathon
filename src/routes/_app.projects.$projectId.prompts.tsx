import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Play, RotateCcw, Save, Wand2 } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { ideaToTitle, store, useStore, type PromptData } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/prompts")({
  head: () => ({ meta: [{ title: "Simulation Brief - Autonomous Startup-in-a-Box" }] }),
  component: PromptsPage,
});

const EMPTY: PromptData = {
  idea: "",
  audience: "",
  problem: "",
  businessModel: "",
  mvpScope: "",
  tone: "",
  constraints: "",
  seedContext: "",
  keySignals: "",
  simulationGoal: "",
  amdFocus: "",
};

const TEMPLATES: { name: string; data: PromptData }[] = [
  {
    name: "Founder Copilot",
    data: {
      idea: "A multi-agent founder copilot that stress-tests a startup idea before the founder builds it.",
      audience: "Early-stage founders, product hackers, and hackathon judges.",
      problem: "Builders jump from inspiration to implementation without a credible system for pressure-testing assumptions.",
      businessModel: "Free demo workspace with a premium founder runtime and team plan.",
      mvpScope: "Simulation brief composer, six-agent execution runtime, shareable report, and live HTML preview.",
      tone: "Cinematic, technical, founder-grade.",
      constraints: "Must preserve AMD branding, ship fast, and feel impressive in a live demo.",
      seedContext: "Use the founder's raw product idea plus a small dossier of assumptions as the world seed.",
      keySignals: "Rise of agentic workflows, founder tool fatigue, need for faster validation loops.",
      simulationGoal: "Determine whether the startup wedge is differentiated enough to win attention and repeat use.",
      amdFocus: "Make AMD GPUs part of the product story by showing visible concurrency and low-latency reasoning.",
    },
  },
  {
    name: "Student AI",
    data: {
      idea: "An AI study execution system that adapts to exam pressure in real time.",
      audience: "Students aged 16-24 preparing for competitive exams or semester finals.",
      problem: "Students know what they should study but fail to convert that into daily execution.",
      businessModel: "Freemium with premium adaptive planning and mentor dashboards.",
      mvpScope: "Study planner, weak-topic detection, accountability loop, and launch report.",
      tone: "Supportive, precise, high-energy.",
      constraints: "Mobile-first, quick to understand, no heavy onboarding.",
      seedContext: "Seed the world with student stress, syllabus overload, and inconsistent routines.",
      keySignals: "Exam anxiety, fragmented study tools, need for adaptive planning.",
      simulationGoal: "Discover whether execution accountability is the true product wedge.",
      amdFocus: "Use AMD compute to emphasize fast adaptation across multiple student personas.",
    },
  },
  {
    name: "Creator Engine",
    data: {
      idea: "A creator operations engine that turns one idea into a whole week of content and distribution moves.",
      audience: "Solo creators and indie media operators across YouTube, X, Instagram, and newsletters.",
      problem: "Creators lose momentum because planning, packaging, and distribution fragment their workflow.",
      businessModel: "Freemium with pro exports, templates, and brand-voice persistence.",
      mvpScope: "Idea planner, hook generator, distribution simulation, and campaign report.",
      tone: "Sharp, modern, creator-native.",
      constraints: "Fast generation, strong visual payoff, and social-ready artifacts.",
      seedContext: "Use content backlog, audience anxiety, and channel fragmentation as the world seed.",
      keySignals: "Creator burnout, demand for consistency, and high competition for attention.",
      simulationGoal: "Find the smallest workflow that delivers a visible momentum boost.",
      amdFocus: "Highlight AMD-powered parallel campaign reasoning across multiple channel strategies.",
    },
  },
];

function PromptsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [data, setData] = useState<PromptData>(project?.prompt ?? { ...EMPTY, idea: project?.idea ?? "" });

  if (!project) {
    return (
      <AppLayout topbar={<Topbar title="Workspace not found" />}>
        <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
          Back to workspaces
        </button>
      </AppLayout>
    );
  }

  function update<K extends keyof PromptData>(key: K, value: PromptData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function applyTemplate(template: PromptData) {
    setData(template);
    toast.success("Simulation template loaded.");
  }

  function savePrompt() {
    store.updateProject(project.id, {
      prompt: data,
      idea: data.idea,
      title: data.idea ? ideaToTitle(data.idea) : project.title,
    });
    toast.success("Simulation brief saved.");
  }

  function improvePrompt() {
    setData((current) => ({
      ...current,
      audience: current.audience || "Founders, operators, or users under real execution pressure.",
      keySignals: current.keySignals || "Speed expectations, trust in visible AI systems, demand for execution clarity.",
      simulationGoal: current.simulationGoal || "Expose the strongest wedge, biggest risk, and fastest go-to-market angle.",
      amdFocus: current.amdFocus || "Frame AMD acceleration as both infrastructure and user-visible product value.",
    }));
    toast.success("Critic pass applied.");
  }

  function generate() {
    savePrompt();
    navigate({ to: "/projects/$projectId/simulation", params: { projectId: project.id }, search: { autostart: 1 } });
  }

  function reset() {
    setData({ ...EMPTY });
    toast("Simulation brief cleared.");
  }

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Step 01</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Reality Seed Brief</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Turn the idea into a simulation-ready startup world by defining the premise, signals, constraints, and AMD compute story.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={improvePrompt} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <Wand2 className="h-3.5 w-3.5 text-primary" /> Critic pass
          </button>
          <button onClick={savePrompt} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.4)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <Save className="h-3.5 w-3.5" /> Save brief
          </button>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={generate} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D", boxShadow: "0 0 18px rgba(255,45,45,0.35)" }}>
            <Play className="h-3.5 w-3.5" /> Run startup world
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
          <div className="grid gap-4">
            <Field label="Startup idea">
              <textarea
                value={data.idea}
                onChange={(e) => update("idea", e.target.value)}
                className="min-h-[110px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
                style={{ borderColor: "#2A2A2A" }}
                placeholder="Describe the startup you want the agents to simulate..."
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Target audience"><Input value={data.audience} onChange={(v) => update("audience", v)} /></Field>
              <Field label="Core problem"><Input value={data.problem} onChange={(v) => update("problem", v)} /></Field>
              <Field label="Business model"><Input value={data.businessModel} onChange={(v) => update("businessModel", v)} /></Field>
              <Field label="MVP release scope"><Input value={data.mvpScope} onChange={(v) => update("mvpScope", v)} /></Field>
              <Field label="Narrative tone"><Input value={data.tone} onChange={(v) => update("tone", v)} /></Field>
              <Field label="Constraints"><Input value={data.constraints} onChange={(v) => update("constraints", v)} /></Field>
            </div>

            <Field label="Reality seed context">
              <textarea
                value={data.seedContext}
                onChange={(e) => update("seedContext", e.target.value)}
                className="min-h-[110px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
                style={{ borderColor: "#2A2A2A" }}
                placeholder="Paste assumptions, founder notes, market context, or any seed material the simulation should anchor to..."
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Key signals and market forces">
                <textarea
                  value={data.keySignals}
                  onChange={(e) => update("keySignals", e.target.value)}
                  className="min-h-[110px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
                  style={{ borderColor: "#2A2A2A" }}
                  placeholder="List shifts, constraints, or trends the world model should consider..."
                />
              </Field>
              <Field label="Simulation goal">
                <textarea
                  value={data.simulationGoal}
                  onChange={(e) => update("simulationGoal", e.target.value)}
                  className="min-h-[110px] w-full resize-none rounded-lg border bg-[#0c0c0e] p-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
                  style={{ borderColor: "#2A2A2A" }}
                  placeholder="What should the agents prove, disprove, or uncover?"
                />
              </Field>
            </div>

            <Field label="AMD runtime focus">
              <div className="relative">
                <Cpu className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-primary" />
                <textarea
                  value={data.amdFocus}
                  onChange={(e) => update("amdFocus", e.target.value)}
                  className="min-h-[88px] w-full resize-none rounded-lg border bg-[#0c0c0e] py-3 pl-10 pr-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
                  style={{ borderColor: "#2A2A2A" }}
                  placeholder="Example: emphasize visible multi-agent concurrency, low-latency reasoning, and AMD Instinct throughput."
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
            <div className="mb-3 text-sm font-semibold">Simulation templates</div>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <motion.button
                  key={template.name}
                  whileHover={{ x: 2 }}
                  onClick={() => applyTemplate(template.data)}
                  className="block w-full rounded-lg border p-3 text-left text-xs transition-colors hover:border-[rgba(255,45,45,0.5)]"
                  style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
                >
                  <div className="font-semibold">{template.name}</div>
                  <div className="mt-1 line-clamp-3 text-muted-foreground">{template.data.idea}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
            <div className="mb-3 text-sm font-semibold">What this brief powers</div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Reality seed and market-force framing inspired by MiroFish's staged simulation workflow.</li>
              <li>Six specialist agents with visible responsibilities and AMD-backed runtime framing.</li>
              <li>A startup-world report spanning validation, product, build, launch, finance, and critic analysis.</li>
            </ul>
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
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border bg-[#0c0c0e] px-3 text-sm outline-none focus:border-[rgba(255,45,45,0.5)]"
      style={{ borderColor: "#2A2A2A" }}
    />
  );
}
