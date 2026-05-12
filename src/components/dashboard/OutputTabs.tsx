import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { OutputData } from "@/lib/mock-outputs";
import type { SimulationReport } from "@/lib/app-store";

const TABS = ["Executive", "World", "Agents", "Validation", "Product", "Build", "Launch", "Finance", "Critic", "Live Preview"] as const;
type Tab = (typeof TABS)[number];

export function OutputTabs({
  data,
  ready,
  backendOutput,
  report,
}: {
  data: OutputData;
  ready: boolean;
  backendOutput?: string;
  report?: SimulationReport;
}) {
  const [tab, setTab] = useState<Tab>("Executive");

  return (
    <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
      <div className="flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: "#2A2A2A" }}>
        {TABS.map((label) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: tab === label ? "rgba(255,45,45,0.12)" : "transparent",
              color: tab === label ? "#FF8585" : "#A1A1AA",
              border: `1px solid ${tab === label ? "rgba(255,45,45,0.5)" : "transparent"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {!ready ? (
          <div className="grid place-items-center py-16 text-sm text-muted-foreground">
            Run the simulation to populate outputs.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
            >
              {tab === "Executive" && <ExecutiveTab report={report} output={backendOutput} />}
              {tab === "World" && <WorldTab report={report} data={data} />}
              {tab === "Agents" && <AgentsTab report={report} />}
              {tab === "Validation" && <ValidationTab report={report} fallback={data} />}
              {tab === "Product" && <ProductTab report={report} fallback={data} />}
              {tab === "Build" && <BuildTab report={report} fallback={data} />}
              {tab === "Launch" && <LaunchTab report={report} fallback={data} />}
              {tab === "Finance" && <FinanceTab report={report} />}
              {tab === "Critic" && <CriticTab report={report} fallback={data} />}
              {tab === "Live Preview" && <LivePreviewTab report={report} output={backendOutput} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ExecutiveTab({ report, output }: { report?: SimulationReport; output?: string }) {
  if (report) {
    return (
      <div className="space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-weak">Executive summary</div>
          <p className="mt-2 text-sm leading-7 text-foreground/90">{report.executive_summary}</p>
        </div>
        <CardGrid>
          <Field label="Audience">{report.startup_brief.audience}</Field>
          <Field label="Problem">{report.startup_brief.problem}</Field>
          <Field label="Business model">{report.startup_brief.business_model}</Field>
          <Field label="AMD focus">{report.startup_brief.amd_focus}</Field>
        </CardGrid>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
      {output ? (
        <ReactMarkdown>{output}</ReactMarkdown>
      ) : (
        <div className="py-10 text-center text-weak italic">No report data available.</div>
      )}
    </div>
  );
}

function WorldTab({ report, data }: { report?: SimulationReport; data: OutputData }) {
  if (!report) {
    return (
      <div className="space-y-4">
        <Field label="Hypothesis">{data.validation.differentiation}</Field>
        <Field label="Growth narrative">{data.growth.summary}</Field>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Field label="Simulation goal">{report.simulation_world.goal}</Field>
      <Field label="Hypothesis">{report.simulation_world.hypothesis}</Field>
      <CardGrid>
        <Field label="Market forces"><Bullets items={report.simulation_world.market_forces} /></Field>
        <Field label="Intervention levers"><Bullets items={report.simulation_world.intervention_levers} /></Field>
      </CardGrid>
      <Field label="Simulation modes">
        <div className="flex flex-wrap gap-2">
          {report.simulation_world.simulation_modes.map((mode) => (
            <Chip key={mode} label={mode} color="green" />
          ))}
        </div>
      </Field>
    </div>
  );
}

function AgentsTab({ report }: { report?: SimulationReport }) {
  if (!report) {
    return <div className="py-10 text-center text-weak italic">Agent roster will appear after the run.</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {report.agents.map((agent) => (
        <div key={agent.name} className="rounded-xl border p-4" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
          <div className="text-xs uppercase tracking-wider text-primary">{agent.role}</div>
          <h3 className="mt-2 font-display text-lg font-semibold">{agent.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{agent.goal}</p>
          <div className="mt-4 space-y-2 text-sm">
            <Field label="Style">{agent.style}</Field>
            <Field label="Deliverable">{agent.deliverable}</Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function ValidationTab({ report, fallback }: { report?: SimulationReport; fallback: OutputData }) {
  if (!report) {
    return <LegacyValidationTab d={fallback.validation} />;
  }

  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Target user">{report.outputs.validation.target_user}</Field>
        <Field label="Readiness score">{report.validation_scorecard.overall}/100</Field>
      </CardGrid>
      <Field label="Market opportunity">{report.outputs.validation.market_opportunity}</Field>
      <Field label="Why now">{report.outputs.validation.why_now}</Field>
      <Field label="Differentiation">{report.outputs.validation.differentiation}</Field>
      <Field label="Competitors"><Bullets items={report.outputs.validation.competitors} /></Field>
      {report.research.sources.length ? (
        <Field label="Sources">
          <div className="space-y-2">
            {report.research.sources.slice(0, 4).map((source) => (
              <a
                key={source.url || source.title}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border p-3 text-sm text-muted-foreground transition-colors hover:border-[rgba(255,45,45,0.45)]"
                style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
              >
                <div className="font-semibold text-foreground">{source.title}</div>
                <div className="mt-1">{source.note}</div>
              </a>
            ))}
          </div>
        </Field>
      ) : null}
      <Field label="Risks"><Bullets items={report.outputs.validation.risks} /></Field>
    </div>
  );
}

function ProductTab({ report, fallback }: { report?: SimulationReport; fallback: OutputData }) {
  if (!report) {
    return <LegacyMvpTab d={fallback.mvp} />;
  }

  return (
    <div className="space-y-4">
      <Field label="North star">{report.outputs.product.north_star}</Field>
      <Field label="Core loop">{report.outputs.product.core_loop}</Field>
      <CardGrid>
        <Field label="MVP features"><Bullets items={report.outputs.product.mvp_features} /></Field>
        <Field label="Persona tracks"><Bullets items={report.outputs.product.persona_tracks} /></Field>
      </CardGrid>
      <Field label="First release scope">{report.outputs.product.first_release_scope}</Field>
    </div>
  );
}

function BuildTab({ report, fallback }: { report?: SimulationReport; fallback: OutputData }) {
  if (!report) {
    return <LegacyCodeTab d={fallback.code} />;
  }

  return (
    <div className="space-y-4">
      <Field label="Suggested stack">
        <div className="flex flex-wrap gap-2">
          {report.outputs.engineering.stack.map((item) => (
            <Chip key={item} label={item} color="green" />
          ))}
        </div>
      </Field>
      <Field label="Architecture"><Bullets items={report.outputs.engineering.architecture} /></Field>
    </div>
  );
}

function LaunchTab({ report, fallback }: { report?: SimulationReport; fallback: OutputData }) {
  if (!report) {
    return <LegacyMarketingTab d={fallback.marketing} />;
  }

  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Target audience">{report.outputs.marketing.target_audience}</Field>
        <Field label="Best channel">{report.outputs.marketing.best_channel}</Field>
      </CardGrid>
      <Field label="Narrative">{report.outputs.marketing.narrative}</Field>
      <Field label="Positioning">{report.outputs.marketing.positioning}</Field>
      <CardGrid>
        <Field label="Channels"><Bullets items={report.outputs.marketing.channels} /></Field>
        <Field label="Hook lines"><Bullets items={report.outputs.marketing.hook_lines} /></Field>
      </CardGrid>
      <Field label="Sample posts"><Bullets items={report.outputs.marketing.sample_posts} /></Field>
      <Field label="Outreach">{report.outputs.marketing.outreach}</Field>
      <Field label="Judge pitch">
        <div className="rounded-lg border p-3 text-sm text-muted-foreground" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
          {report.outputs.marketing.judge_pitch}
        </div>
      </Field>
    </div>
  );
}

function FinanceTab({ report }: { report?: SimulationReport }) {
  if (!report) {
    return <div className="py-10 text-center text-weak italic">Finance analysis will appear after the run.</div>;
  }

  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Pricing">{report.outputs.finance.pricing}</Field>
        <Field label="Revenue logic">{report.outputs.finance.revenue_logic}</Field>
      </CardGrid>
      <Field label="Cost drivers"><Bullets items={report.outputs.finance.cost_drivers} /></Field>
      <Field label="First-year view">{report.outputs.finance.first_year}</Field>
    </div>
  );
}

function CriticTab({ report, fallback }: { report?: SimulationReport; fallback: OutputData }) {
  if (!report) {
    return <LegacyCriticTab d={fallback.critic} />;
  }

  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Main failure mode">{report.outputs.critic.main_failure_mode}</Field>
        <Field label="Hardest assumption">{report.outputs.critic.hardest_assumption}</Field>
      </CardGrid>
      <Field label="Fix first">
        <div className="rounded-lg border p-3 text-sm" style={{ background: "rgba(60,255,122,0.06)", borderColor: "rgba(60,255,122,0.35)" }}>
          <Bullets items={report.outputs.critic.fix_first} />
        </div>
      </Field>
    </div>
  );
}

function LivePreviewTab({ report, output }: { report?: SimulationReport; output?: string }) {
  let htmlContent = report?.outputs.engineering.preview_html ?? "";

  if (!htmlContent && output) {
    const htmlMatch = output.match(/```html([\s\S]*?)```/i);
    if (htmlMatch?.[1]) htmlContent = htmlMatch[1].trim();
  }

  if (!htmlContent) {
    return <div className="py-10 text-center text-weak italic">No preview HTML available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Live startup preview</h3>
        <span className="rounded-full border border-[rgba(255,45,45,0.4)] bg-[rgba(255,45,45,0.12)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
          AMD Render Story
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-white">
        <iframe srcDoc={htmlContent} className="h-[500px] w-full border-0" sandbox="allow-scripts" title="Live Preview" />
      </div>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: "green" | "neutral" }) {
  const style =
    color === "green"
      ? { background: "rgba(60,255,122,0.08)", borderColor: "rgba(60,255,122,0.35)", color: "#3CFF7A" }
      : { background: "#181818", borderColor: "#2A2A2A", color: "#A1A1AA" };
  return (
    <span className="rounded-full border px-2 py-0.5 text-xs" style={style}>
      {label}
    </span>
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

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-foreground">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#3CFF7A" }} /> {it}
        </li>
      ))}
    </ul>
  );
}

function LegacyValidationTab({ d }: { d: OutputData["validation"] }) {
  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Problem strength">{d.problemStrength}</Field>
        <Field label="Validation score">{d.score}</Field>
        <Field label="Target user">{d.targetUser}</Field>
        <Field label="Market risk">{d.marketRisk}</Field>
      </CardGrid>
      <Field label="Differentiation">{d.differentiation}</Field>
    </div>
  );
}

function LegacyMvpTab({ d }: { d: OutputData["mvp"] }) {
  return (
    <div className="space-y-4">
      <Field label="Core features"><Bullets items={d.coreFeatures} /></Field>
      <CardGrid>
        <Field label="Must have"><Bullets items={d.mustHave} /></Field>
        <Field label="Nice to have"><Bullets items={d.niceToHave} /></Field>
      </CardGrid>
      <Field label="User flow">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {d.userFlow.map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="rounded-md border px-2 py-1 text-xs" style={{ background: "#181818", borderColor: "#2A2A2A" }}>{s}</span>
              {i < d.userFlow.length - 1 && <span className="text-weak">→</span>}
            </span>
          ))}
        </div>
      </Field>
      <Field label="First version scope">{d.firstVersion}</Field>
    </div>
  );
}

function LegacyCodeTab({ d }: { d: OutputData["code"] }) {
  return (
    <div className="space-y-4">
      <Field label="Suggested stack">
        <div className="flex flex-wrap gap-2">
          {d.stack.map((item) => (
            <Chip key={item} label={item} color="green" />
          ))}
        </div>
      </Field>
      <Field label="Architecture"><Bullets items={d.folders} /></Field>
    </div>
  );
}

function LegacyMarketingTab({ d }: { d: OutputData["marketing"] }) {
  return (
    <div className="space-y-4">
      <Field label="ICP">{d.icp}</Field>
      <Field label="Launch channels"><Bullets items={d.channels} /></Field>
      <Field label="Social posts"><Bullets items={d.posts} /></Field>
      <Field label="Outreach">{d.outreach}</Field>
    </div>
  );
}

function LegacyCriticTab({ d }: { d: OutputData["critic"] }) {
  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Weakest assumption">{d.weakest}</Field>
        <Field label="Biggest risk">{d.risk}</Field>
        <Field label="What will fail">{d.fail}</Field>
        <Field label="Fix first">{d.fix}</Field>
      </CardGrid>
    </div>
  );
}
