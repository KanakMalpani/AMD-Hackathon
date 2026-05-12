import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Copy,
  Download,
  Megaphone,
  Megaphone as MegaphoneIcon,
  PencilLine,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout, Topbar } from "@/components/AppShell";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useStore } from "@/lib/app-store";
import { buildOutputs, personaFor } from "@/lib/mock-outputs";
import { getBestChannel, getTargetAudience } from "@/lib/report-view";

export const Route = createFileRoute("/_app/projects/$projectId/marketing")({
  head: () => ({ meta: [{ title: "Go-To-Market - LaunchMyIdea AI" }] }),
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
  const report = project?.simulationReport;

  if (!project || !data || !persona) {
    return (
      <AppLayout topbar={<Topbar title="Startup not found" />}>
        <button
          onClick={() => navigate({ to: "/projects" })}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
          style={{ background: "#FF2D2D" }}
        >
          Back to startups
        </button>
      </AppLayout>
    );
  }

  const summaryCards = [
    { label: "Ideal customer", value: report?.outputs.marketing.target_audience ?? getTargetAudience(project) },
    { label: "Main pain point", value: report?.research.target_pain ?? data.critic.risk },
    { label: "Core promise", value: report?.outputs.marketing.positioning ?? data.landing.subheading },
    { label: "Best channel", value: report?.outputs.marketing.best_channel ?? getBestChannel(project) },
  ];

  const channelNames = report?.outputs.marketing.channels ?? persona.channels.map((c) => c.name);
  const socialPosts = report?.outputs.marketing.sample_posts ?? data.marketing.posts;
  const outreachCopy =
    report?.outputs.marketing.outreach ??
    `Subject: quick idea for ${persona.audience.split(",")[0]}\n\nHi {first_name}, I built ${project.title} after seeing the same problem 5x this month. Would love your honest take - 2 minutes max.`;
  const firstMove =
    report?.outputs.marketing.next_step ??
    `${persona.channels[0].firstAction} Get one signal in 24 hours - momentum compounds.`;

  function regenerate() {
    setRegenerating(true);
    setTimeout(() => {
      setSeed((s) => s + 1);
      setRegenerating(false);
      toast.success("Marketing plan refreshed.");
    }, 650);
  }

  function copyAll() {
    navigator.clipboard?.writeText(
      JSON.stringify(
        {
          targetAudience: report?.outputs.marketing.target_audience ?? getTargetAudience(project),
          positioning: report?.outputs.marketing.positioning ?? data.validation.differentiation,
          channels: channelNames,
          socialPosts,
          outreach: outreachCopy,
        },
        null,
        2,
      ),
    );
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
            {
              label: project.idea?.trim() ? "Run simulation" : "Open dashboard",
              to: project.idea?.trim() ? "/projects/$projectId/simulation" : "/projects/$projectId/dashboard",
              projectId: project.id,
              icon: project.idea?.trim() ? Activity : PencilLine,
            },
          ]}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout topbar={<Topbar project={project} />}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Go-to-market</div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Go-To-Market Plan</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={regenerate}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]"
            style={{ background: "#181818", borderColor: "#2A2A2A" }}
          >
            <RefreshCw className={"h-3.5 w-3.5 " + (regenerating ? "animate-spin" : "")} /> Refresh
          </button>
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(60,255,122,0.4)]"
            style={{ background: "#181818", borderColor: "#2A2A2A" }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy all
          </button>
          <button
            onClick={exportPlan}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ background: "#FF2D2D" }}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ background: "#111", borderColor: "#2A2A2A" }}
          >
            <div className="text-[10px] uppercase tracking-wider text-weak">{card.label}</div>
            <div className="mt-1.5 text-xs">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5 border-b" style={{ borderColor: "#2A2A2A" }}>
        {TABS.map((item) => {
          const selected = tab === item;
          return (
            <button
              key={item}
              onClick={() => setTab(item)}
              className="relative px-3 py-2 text-xs font-semibold transition-colors"
              style={{ color: selected ? "#FF8585" : "#A1A1AA" }}
            >
              {item}
              {selected ? (
                <motion.span
                  layoutId="marketing-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{ background: "#FF2D2D", boxShadow: "0 0 12px rgba(255,45,45,0.55)" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}_${seed}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "Audience" ? (
            <Grid>
              <Card title="Primary persona" body={report?.outputs.marketing.target_audience ?? persona.audience} />
              <Card title="Secondary persona" body="Adjacent users discovering the product through word-of-mouth." />
              <Card title="Pain points" list={report?.research.demand_signals ?? ["Wastes hours planning", "Quits halfway through", "Can't measure progress"]} />
              <Card title="Buying triggers" list={report?.research.monetization_signals ?? ["Saw a peer succeed", "Hit a personal deadline", "Discount or trial nudge"]} />
              <Card title="Top objections" list={report?.outputs.validation.risks ?? ["Will it work for me?", "Is it just another GPT wrapper?", "Worth the price?"]} />
            </Grid>
          ) : null}

          {tab === "Positioning" ? (
            <Grid>
              <Card title="One-line positioning" body={report?.outputs.marketing.positioning ?? data.landing.headline} accent />
              <Card title="Category" body="AI-powered launch platform" />
              <Card title="Differentiator" body={report?.outputs.validation.differentiation ?? data.validation.differentiation} />
              <Card title="Why now" body={report?.outputs.validation.why_now ?? "AI infra is finally cheap enough for small teams to run visible, multi-agent startup simulations."} />
              <Card title="Competitor alternative" body="Pasting raw prompts into a general AI chat and hoping the plan sticks." />
              <Card title="Research summary" body={report?.research.summary ?? data.growth.summary} />
            </Grid>
          ) : null}

          {tab === "Channels" ? (
            <Grid>
              {channelNames.map((channel, index) => (
                <div key={channel} className="rounded-2xl border p-4" style={{ background: "#111", borderColor: "#2A2A2A" }}>
                  <div className="flex items-start justify-between">
                    <div className="font-semibold">{channel}</div>
                    <div className="flex gap-1">
                      <Badge tone={index === 0 ? "green" : "muted"}>{index === 0 ? "High" : "Medium"} impact</Badge>
                      <Badge tone={index === 0 ? "green" : index > 2 ? "red" : "muted"}>{index === 0 ? "Low" : index > 2 ? "High" : "Medium"} effort</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    First action: {index === 0 ? firstMove : `Create one proof asset tailored for ${channel}.`}
                  </p>
                </div>
              ))}
            </Grid>
          ) : null}

          {tab === "Content Plan" ? (
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
                    ["Day 1", channelNames[0] ?? getBestChannel(project), "Launch teaser", "Watch a raw idea become a startup plan.", "Follow the build"],
                    ["Day 2", "Twitter/X", "Pain story", "This idea solves a problem founders waste weeks on.", "Try it free"],
                    ["Day 3", "YouTube Shorts", "Live demo", "See six agents validate one startup in real time.", "Get early access"],
                    ["Day 4", channelNames[1] ?? "Reddit", "Behind the scenes", "Here is the actual execution logic behind the product.", "Comment your idea"],
                    ["Day 5", "Newsletter", "Lessons learned", "What the research said and how the plan changed.", "Subscribe"],
                    ["Day 6", "Product Hunt", "Soft preview", "Launching next week.", "Notify me"],
                    ["Day 7", "All channels", "Launch day", "The startup world is live.", "Join now"],
                  ].map((row, index) => (
                    <tr key={index} className="border-t" style={{ borderColor: "#2A2A2A" }}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${index}_${cellIndex}`} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === "Ad Copy" ? (
            <Grid>
              <Card
                title="Short ads"
                list={[
                  `${project.title}: ship the idea, not the doubt.`,
                  "Stop drafting startup docs. Start validating.",
                  'From "I have an idea" to "here is the launch plan" in one run.',
                ]}
              />
              <Card title="Social posts" list={socialPosts} />
              <Card
                title="Landing page hooks"
                list={[
                  `${project.title} is your AI co-founder.`,
                  "Built for founders who would rather ship than plan forever.",
                  "Your idea. Researched, scoped, and challenged.",
                ]}
              />
              <Card
                title="Email subject lines"
                list={[
                  "Your startup world is ready for launch review",
                  `[${project.title}] week 1 - here is what shipped`,
                  "Quick favor - can you pressure-test this idea?",
                ]}
              />
            </Grid>
          ) : null}

          {tab === "Outreach" ? (
            <Grid>
              <Card
                title="DM template"
                body={`Hey - saw you talk about ${getTargetAudience(project).split(",")[0]}. Built ${project.title} for exactly that. 60s demo?`}
              />
              <Card title="Cold email" body={outreachCopy} />
              <Card title="Community post" body={`Hey r/SaaS - sharing what I learned shipping ${project.title} in 48h. AMA.`} />
              <Card title="Influencer outreach" body={`Hey - your audience is exactly who ${project.title} is built for. Free lifetime access if you want to try it on stream.`} />
            </Grid>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 rounded-2xl border p-5" style={{ background: "#111", borderColor: "#2A2A2A" }}>
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">Suggested first move</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{firstMove}</p>
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
      {body ? <p className="mt-1.5 whitespace-pre-line text-xs">{body}</p> : null}
      {list ? (
        <ul className="mt-2 space-y-1.5 text-xs">
          {list.map((item, index) => (
            <li key={`${title}_${index}`} className="flex gap-2">
              <span className="text-primary">-</span> {item}
            </li>
          ))}
        </ul>
      ) : null}
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
