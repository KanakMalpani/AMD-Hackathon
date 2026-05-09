import { useSyncExternalStore } from "react";

export type Stage = {
  key: string;
  title: string;
  description: string;
  status: "pending" | "running" | "complete";
};

export type ActivityMsg = {
  id: string;
  agent: string;
  text: string;
  ts: string;
  done?: boolean;
};

export type PromptData = {
  idea: string;
  audience: string;
  problem: string;
  businessModel: string;
  mvpScope: string;
  tone: string;
  constraints: string;
  seedContext: string;
  keySignals: string;
  simulationGoal: string;
  amdFocus: string;
};

export type SavedPrompt = {
  id: string;
  title: string;
  data: PromptData;
  createdAt: number;
};

export type SimSettings = {
  depth: "Fast" | "Balanced" | "Deep";
  strictness: "Soft" | "Normal" | "Brutal";
  outputs: string[];
  includeAMD: boolean;
  includeCritic: boolean;
  includeCode: boolean;
};

export type AgentPersona = {
  name: string;
  role: string;
  goal: string;
  style: string;
  deliverable: string;
};

export type SimulationReport = {
  title: string;
  readiness_score: number;
  executive_summary: string;
  startup_brief: {
    idea: string;
    audience: string;
    problem: string;
    business_model: string;
    tone: string;
    constraints: string;
    seed_context: string;
    key_signals: string;
    amd_focus: string;
  };
  simulation_world: {
    goal: string;
    hypothesis: string;
    market_forces: string[];
    intervention_levers: string[];
    simulation_modes: string[];
  };
  agents: AgentPersona[];
  outputs: {
    validation: {
      market_opportunity: string;
      why_now: string;
      differentiation: string;
      risks: string[];
    };
    product: {
      north_star: string;
      core_loop: string;
      mvp_features: string[];
      persona_tracks: string[];
      first_release_scope: string;
    };
    engineering: {
      stack: string[];
      architecture: string[];
      preview_html: string;
    };
    marketing: {
      narrative: string;
      channels: string[];
      hook_lines: string[];
      judge_pitch: string;
    };
    finance: {
      pricing: string;
      revenue_logic: string;
      cost_drivers: string[];
      first_year: string;
    };
    critic: {
      main_failure_mode: string;
      hardest_assumption: string;
      fix_first: string[];
    };
  };
};

export type Project = {
  id: string;
  title: string;
  idea: string;
  createdAt: number;
  status: "Draft" | "Simulating" | "Needs Review" | "Launch Ready";
  launchReadiness: number;
  currentStage: number;
  stages: Stage[];
  activity: ActivityMsg[];
  outputsReady: boolean;
  prompt?: PromptData;
  promptHistory?: SavedPrompt[];
  simSettings?: SimSettings;
  backendOutput?: string;
  simulationReport?: SimulationReport;
};

export type User = {
  name: string;
  email: string;
  role: string;
  bio: string;
  prefs: {
    animation: "Normal" | "Reduced";
    exportFormat: "PDF" | "Markdown";
    focus: string;
  };
};

type State = {
  user: User | null;
  projects: Project[];
};

const KEY = "autonomous_startup_box_v2";

const DEFAULT_USER: User = {
  name: "Demo Founder",
  email: "founder@amd-hackathon.ai",
  role: "Hackathon Builder",
  bio: "Building startup worlds with visible AI orchestration.",
  prefs: { animation: "Normal", exportFormat: "Markdown", focus: "AI Infrastructure" },
};

export const STAGE_TEMPLATE: Omit<Stage, "status">[] = [
  { key: "seed", title: "Reality Seed", description: "Startup premise and source signals locked" },
  { key: "strategy", title: "CEO Strategy", description: "Thesis, wedge, and mission drafted" },
  { key: "world", title: "World Model", description: "Market forces and simulation modes assembled" },
  { key: "agents", title: "Agent Cast", description: "Specialist personas and responsibilities generated" },
  { key: "build", title: "Build Plan", description: "MVP stack, flow, and preview scaffold designed" },
  { key: "launch", title: "Launch Motion", description: "Narrative, channels, and GTM hooks generated" },
  { key: "finance", title: "Revenue Model", description: "Pricing, cost logic, and viability evaluated" },
  { key: "critic", title: "Critic Loop", description: "Weak assumptions attacked and improved" },
  { key: "report", title: "AMD Report", description: "Final startup-world report published" },
];

function freshStages(): Stage[] {
  return STAGE_TEMPLATE.map((s, i) => ({ ...s, status: i === 0 ? "complete" : "pending" }));
}

function load(): State {
  if (typeof window === "undefined") return { user: null, projects: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, projects: [] };
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
  listeners.forEach((l) => l());
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
  login(email: string, name?: string) {
    set((s) => ({
      ...s,
      user: {
        ...DEFAULT_USER,
        ...(s.user ?? {}),
        email: email || s.user?.email || DEFAULT_USER.email,
        ...(name ? { name } : {}),
      },
    }));
  },
  signup(name: string, email: string) {
    set((s) => ({ ...s, user: { ...DEFAULT_USER, name, email } }));
  },
  loginDemo() {
    set((s) => ({ ...s, user: { ...DEFAULT_USER } }));
  },
  logout() {
    set((s) => ({ ...s, user: null }));
  },
  updateUser(patch: Partial<User>) {
    set((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
  },
  createProject(idea = ""): Project {
    const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const title = ideaToTitle(idea);
    const project: Project = {
      id,
      title,
      idea,
      createdAt: Date.now(),
      status: "Draft",
      launchReadiness: 0,
      currentStage: 0,
      stages: freshStages(),
      activity: [],
      outputsReady: false,
    };
    set((s) => ({ ...s, projects: [project, ...s.projects] }));
    return project;
  },
  updateProject(id: string, patch: Partial<Project>) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  },
  deleteProject(id: string) {
    set((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }));
  },
  resetSimulation(id: string) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              launchReadiness: 0,
              currentStage: 0,
              stages: freshStages(),
              activity: [],
              outputsReady: false,
              status: "Draft",
              backendOutput: undefined,
              simulationReport: undefined,
            }
          : p,
      ),
    }));
  },
  advanceStage(id: string, idx: number) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => {
        if (p.id !== id) return p;
        const stages = p.stages.map((st, i) => ({
          ...st,
          status:
            i < idx ? ("complete" as const) : i === idx ? ("running" as const) : ("pending" as const),
        }));
        return { ...p, stages, currentStage: idx };
      }),
    }));
  },
  completeStage(id: string, idx: number) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => {
        if (p.id !== id) return p;
        const stages = p.stages.map((st, i) => ({
          ...st,
          status: i <= idx ? ("complete" as const) : ("pending" as const),
        }));
        return { ...p, stages };
      }),
    }));
  },
  setReadiness(id: string, n: number) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              launchReadiness: n,
              status: n >= 80 ? "Launch Ready" : n > 0 ? "Simulating" : p.status,
            }
          : p,
      ),
    }));
  },
  addActivity(id: string, msg: ActivityMsg) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, activity: [...p.activity, msg] } : p,
      ),
    }));
  },
  setOutputsReady(id: string, v: boolean) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, outputsReady: v } : p)),
    }));
  },
  setBackendOutput(id: string, output: string) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, backendOutput: output } : p)),
    }));
  },
  setSimulationReport(id: string, report: SimulationReport) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, simulationReport: report } : p)),
    }));
  },
  syncSimulation(
    id: string,
    patch: Partial<
      Pick<Project, "activity" | "stages" | "launchReadiness" | "backendOutput" | "simulationReport" | "outputsReady" | "status" | "currentStage">
    >,
  ) {
    set((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  },
};

export function ideaToTitle(idea: string): string {
  if (!idea || !idea.trim()) return "Untitled Startup World";
  const stop = new Set([
    "i", "want", "to", "build", "a", "an", "the", "for", "that", "helps", "of", "and", "with",
    "app", "tool", "my", "is", "make", "create", "platform", "using", "in", "on", "ai",
  ]);
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w));
  const pick = words.slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1));
  if (pick.length === 0) return "New Startup World";
  if (pick.length === 1) return `${pick[0]} World`;
  return pick.join(" ");
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
