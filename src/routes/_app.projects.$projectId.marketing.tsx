import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, Download, Megaphone, PencilLine, Activity, Megaphone as MegaphoneIcon } from "lucide-react";
import { AppLayout, Topbar } from "@/components/AppShell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useStore } from "@/lib/app-store";
import { buildOutputs, personaFor } from "@/lib/mock-outputs";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/marketing")({
  head: () => ({ meta: [{ title: "Launch Plan — LaunchMyIdea" }] }),
  component: MarketingPage,
});

const TABS = ["Audience", "Positioning", "Channels", "Content Plan", "Ad Copy", "Outreach"] as const;
type Tab = (typeof TABS)[number];

function MarketingPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [tab, setTab] = useState<Tab>("Audience");
  const [seed, setSeed] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const data = useMemo(() => (project ? buildOutputs(project) : null), [project, seed]);
  const persona = useMemo(() => (project ? personaFor(project.idea) : null), [project]);

  if (!project || !data || !persona) {
    return (
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <button onClick={() => navigate({ to: "/projects" })} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
          Back to startups
        </button>
      </AppLayout>
    );
  }

  function regenerate() {
    setRegenerating(true);
    setTimeout(() => {
      setSeed((s) => s + 1);
      setRegenerating(false);
      toast.success("Marketing plan regenerated.");
    }, 900);
  }

  function copyAll() {
    navigator.clipboard?.writeText(JSON.stringify(data!.marketing, null, 2));
    toast.success("Marketing plan copied.");
  }

  function exportPlan() {
    toast("Launch plan exported as PDF (preview).");
  }

  if (!project.outputsReady) {
    return (
      <AppLayout topbar={<Topbar project={project} />}>
        <EmptyState
          eyebrow="Marketing plan"
          title="Your marketing plan unlocks after the simulation."
          description="Audience, positioning, channels, content, and outreach are generated from your simulation results. Add a prompt and run the simulation to bring this page to life."
          steps={[
            { icon: PencilLine, title: "Write your prompt", description: "Describe your idea on the dashboard.", done: !!project.idea?.trim() },
            { icon: Activity, title: "Run the simulation", description: "Let the agents validate and generate outputs." },
            { icon: MegaphoneIcon, title: "Review your launch plan", description: "Channels, copy, and outreach appear right here." },
          ]}
          actions={[
            { label: project.idea?.trim() ? "Run simulation" : "Open dashboard", to: project.idea?.trim() ? "/projects/$projectId/simulation" : "/projects/$projectId/dashboard", projectId: project.id, icon: project.idea?.trim() ? Activity : PencilLine },
          ]}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Launch strategy</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Launch Plan</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={regenerate} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <RefreshCw className={"h-3.5 w-3.5 " + (regenerating ? "animate-spin" : "")} /> Regenerate
          </button>
          <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.4)]" style={{ background: "#181818", borderColor: "#2A2A2A" }}>
            <Copy className="h-3.5 w-3.5" /> Copy all
          </button>
          <button onClick={exportPlan} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Strategy summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ideal customer", value: persona.audience },
          { label: "Main pain point", value: data.critic.risk },
          { label: "Core promise", value: data.landing.subheading },
          { label: "Best channel", value: persona.channels[0].name },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border p-4" style={{ background: "#111", borderColor: "#2A2A2A" }}>
            <div className="text-[10px] uppercase tracking-wider text-weak">{c.label}</div>
            <div className="mt-1.5 text-xs">{c.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5 border-b" style={{ borderColor: "#2A2A2A" }}>
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-3 py-2 text-xs font-semibold transition-colors"
              style={{ color: on ? "#FF8585" : "#A1A1AA" }}
            >
              {t}
              {on && (
                <motion.span
                  layoutId="mk-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{ background: "#FF2D2D", boxShadow: "0 0 12px rgba(255,45,45,0.55)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab + seed}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "Audience" && (
            <Grid>
              <Card title="Primary persona" body={persona.audience} />
              <Card title="Secondary persona" body="Adjacent users discovering the product through word-of-mouth." />
              <Card title="Pain points" list={["Wastes hours planning", "Quits halfway through", "Can't measure progress"]} />
              <Card title="Buying triggers" list={["Saw a peer succeed", "Hit a personal deadline", "Discount or trial nudge"]} />
              <Card title="Top objections" list={["Will it work for me?", "Is it just another GPT wrapper?", "Worth the price?"]} />
            </Grid>
          )}
          {tab === "Positioning" && (
            <Grid>
              <Card title="One-line positioning" body={data.landing.headline} accent />
              <Card title="Category" body="AI-powered launch platform" />
              <Card title="Differentiator" body={data.validation.differentiation} />
              <Card title="Why now" body="AI infra is finally cheap enough for indie founders to ship full launch packages." />
              <Card title="Competitor alternative" body="Pasting raw prompts into ChatGPT and hoping the plan sticks." />
            </Grid>
          )}
          {tab === "Channels" && (
            <Grid>
              {persona.channels.map((c) => (
                <div key={c.name} className="rounded-2xl border p-4" style={{ background: "#111", borderColor: "#2A2A2A" }}>
                  <div className="flex items-start justify-between">
                    <div className="font-semibold">{c.name}</div>
                    <div className="flex gap-1">
                      <Badge tone={c.impact === "High" ? "green" : "muted"}>{c.impact} impact</Badge>
                      <Badge tone={c.effort === "Low" ? "green" : c.effort === "High" ? "red" : "muted"}>{c.effort} effort</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">First action: {c.firstAction}</p>
                </div>
              ))}
            </Grid>
          )}
          {tab === "Content Plan" && (
            <div className="overflow-hidden rounded-2xl border" style={{ background: "#111", borderColor: "#2A2A2A" }}>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-weak">
                  <tr style={{ background: "#0c0c0e" }}>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Idea</th>
                    <th className="px-4 py-3">Hook</th>
                    <th className="px-4 py-3">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Day 1", persona.channels[0].name, "Launch teaser", "I'm building this in public.", "Follow the build"],
                    ["Day 2", "Twitter/X", "Pain story", "I wasted 3 weeks on planning.", "Try it free"],
                    ["Day 3", "YouTube Shorts", "Live demo", "Watch a raw idea become a launch.", "Get early access"],
                    ["Day 4", persona.channels[1]?.name ?? "Reddit", "Behind the scenes", "Here's the actual stack I'm using.", "Comment your idea"],
                    ["Day 5", "Newsletter", "Lessons learned", "5 mistakes I made shipping.", "Subscribe"],
                    ["Day 6", "Product Hunt", "Soft preview", "Launching next week.", "Notify me"],
                    ["Day 7", "All channels", "LAUNCH DAY", "It's live.", "Join now"],
                  ].map((r, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "#2A2A2A" }}>
                      {r.map((c, j) => (
                        <td key={j} className="px-4 py-3">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "Ad Copy" && (
            <Grid>
              <Card title="Short ads" list={[
                `${project.title}: ship the idea, not the doubt.`,
                `Stop drafting Notion docs. Start launching.`,
                `From "I have an idea" to "here's the MVP" — instantly.`,
              ]} />
              <Card title="Social posts" list={data.marketing.posts} />
              <Card title="Landing page hooks" list={[
                `${project.title} is your AI co-founder.`,
                `Built for founders who'd rather ship than plan.`,
                `Your idea. Validated, scoped, launched.`,
              ]} />
              <Card title="Email subject lines" list={[
                `Your launch package is ready 🚀`,
                `[${project.title}] week 1 — here's what shipped`,
                `Quick favor — try this in 60 seconds?`,
              ]} />
            </Grid>
          )}
          {tab === "Outreach" && (
            <Grid>
              <Card title="DM template" body={`Hey — saw you tweet about ${persona.audience.split(",")[0]}. Built ${project.title} for exactly that. 60s demo?`} />
              <Card title="Cold email" body={`Subject: quick idea for ${persona.audience.split(",")[0]}\n\nHi {first_name}, I built ${project.title} after seeing the same problem 5x this month. Would love your honest take — 2 minutes max.`} />
              <Card title="Community post" body={`Hey r/SaaS — sharing what I learned shipping ${project.title} in 48h. AMA.`} />
              <Card title="Influencer outreach" body={`Hey — your audience is exactly who ${project.title} is built for. Free lifetime access if you want to try it on stream.`} />
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">Suggested first move</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {persona.channels[0].firstAction} Get one signal in 24 hours — momentum compounds.
        </p>
      </div>
    </AppLayout>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Card({ title, body, list, accent }: { title: string; body?: string; list?: string[]; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border p-4"
      style={{
        background: accent ? "rgba(255,45,45,0.06)" : "#111",
        borderColor: accent ? "rgba(255,45,45,0.4)" : "#2A2A2A",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider text-weak">{title}</div>
      {body && <p className="mt-1.5 whitespace-pre-line text-xs">{body}</p>}
      {list && (
        <ul className="mt-2 space-y-1.5 text-xs">
          {list.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span> {l}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "red" | "muted" }) {
  const colors = {
    green: { bg: "rgba(60,255,122,0.12)", border: "rgba(60,255,122,0.4)", text: "#3CFF7A" },
    red: { bg: "rgba(255,45,45,0.12)", border: "rgba(255,45,45,0.4)", text: "#FF8585" },
    muted: { bg: "#181818", border: "#2A2A2A", text: "#A1A1AA" },
  }[tone];
  return (
    <span
      className="rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
    >
      {children}
    </span>
  );
}
