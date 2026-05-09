import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { OutputData } from "@/lib/mock-outputs";
import { Check } from "lucide-react";

import ReactMarkdown from "react-markdown";

const TABS = ["AMD AI Plan", "Live Preview", "Validation", "MVP", "Landing", "Code", "Marketing", "Growth", "Critic"] as const;
type Tab = (typeof TABS)[number];

export function OutputTabs({ data, ready, backendOutput }: { data: OutputData; ready: boolean; backendOutput?: string }) {
  const [tab, setTab] = useState<Tab>("AMD AI Plan");

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <div className="flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: "#2A2A2A" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: tab === t ? "rgba(255,45,45,0.12)" : "transparent",
              color: tab === t ? "#FF8585" : "#A1A1AA",
              border: `1px solid ${tab === t ? "rgba(255,45,45,0.5)" : "transparent"}`,
            }}
          >
            {t}
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
              {tab === "AMD AI Plan" && <AmdPlanTab output={backendOutput} />}
              {tab === "Live Preview" && <LivePreviewTab output={backendOutput} />}
              {tab === "Validation" && <ValidationTab d={data.validation} />}
              {tab === "MVP" && <MvpTab d={data.mvp} />}
              {tab === "Landing" && <LandingTab d={data.landing} />}
              {tab === "Code" && <CodeTab d={data.code} />}
              {tab === "Marketing" && <MarketingTab d={data.marketing} />}
              {tab === "Growth" && <GrowthTab d={data.growth} />}
              {tab === "Critic" && <CriticTab d={data.critic} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function AmdPlanTab({ output }: { output?: string }) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
      {output ? (
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => <h1 className="mt-6 mb-4 text-xl font-bold text-primary" {...props} />,
            h2: ({ ...props }) => <h2 className="mt-5 mb-3 text-lg font-bold text-foreground" {...props} />,
            h3: ({ ...props }) => <h3 className="mt-4 mb-2 text-base font-semibold text-foreground/80" {...props} />,
            p: ({ ...props }) => <p className="mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="mb-4 list-disc pl-5 space-y-2" {...props} />,
            li: ({ ...props }) => <li {...props} />,
            strong: ({ ...props }) => <strong className="font-bold text-primary" {...props} />,
          }}
        >
          {output}
        </ReactMarkdown>
      ) : (
        <div className="py-10 text-center text-weak italic">No raw plan data available.</div>
      )}
    </div>
  );
}

function LivePreviewTab({ output }: { output?: string }) {
  if (!output) {
    return <div className="py-10 text-center text-weak italic">No HTML data available.</div>;
  }
  
  // Extract HTML between ```html and ```
  const htmlMatch = output.match(/```html([\s\S]*?)```/i);
  let htmlContent = "";
  
  if (htmlMatch && htmlMatch[1]) {
    htmlContent = htmlMatch[1].trim();
  } else {
    // Fallback if no markdown block is found, try to find raw HTML
    const bodyMatch = output.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (bodyMatch) {
      htmlContent = bodyMatch[0];
    } else {
      return <div className="py-10 text-center text-weak italic">No functional HTML could be extracted from the plan.</div>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Live MVP Preview</h3>
        <span className="rounded-full border border-[rgba(255,45,45,0.4)] bg-[rgba(255,45,45,0.12)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
          Rendered by AMD ROCm
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-white">
        <iframe 
          srcDoc={htmlContent} 
          className="h-[500px] w-full border-0"
          sandbox="allow-scripts"
          title="Live Preview"
        />
      </div>
    </div>
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

function ValidationTab({ d }: { d: OutputData["validation"] }) {
  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Problem strength">
          <ScoreBar v={d.problemStrength} />
        </Field>
        <Field label="Validation score">
          <ScoreBar v={d.score} />
        </Field>
        <Field label="Target user">{d.targetUser}</Field>
        <Field label="Market risk">{d.marketRisk}</Field>
      </CardGrid>
      <Field label="Differentiation">{d.differentiation}</Field>
      <Field label="Competitors">
        <div className="flex flex-wrap gap-2">
          {d.competitors.map((c) => (
            <span
              key={c}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
              style={{ background: "#181818", borderColor: "#2A2A2A" }}
            >
              {c}
            </span>
          ))}
        </div>
      </Field>
    </div>
  );
}

function MvpTab({ d }: { d: OutputData["mvp"] }) {
  return (
    <div className="space-y-4">
      <Field label="Core features"><Bullets items={d.coreFeatures} /></Field>
      <CardGrid>
        <Field label="Must have"><Bullets items={d.mustHave} /></Field>
        <Field label="Nice to have">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {d.niceToHave.map((it, i) => <li key={i}>• {it}</li>)}
          </ul>
        </Field>
      </CardGrid>
      <Field label="User flow">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {d.userFlow.map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                className="rounded-md border px-2 py-1 text-xs"
                style={{ background: "#181818", borderColor: "#2A2A2A" }}
              >{s}</span>
              {i < d.userFlow.length - 1 && <span className="text-weak">→</span>}
            </span>
          ))}
        </div>
      </Field>
      <Field label="First version scope">{d.firstVersion}</Field>
    </div>
  );
}

function LandingTab({ d }: { d: OutputData["landing"] }) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border p-5"
        style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}
      >
        <h3 className="font-display text-2xl font-bold">{d.headline}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{d.subheading}</p>
        <button
          className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white"
          style={{ background: "#FF2D2D" }}
        >{d.cta}</button>
      </div>
      <Field label="Feature bullets"><Bullets items={d.bullets} /></Field>
    </div>
  );
}

function CodeTab({ d }: { d: OutputData["code"] }) {
  return (
    <div className="space-y-4">
      <Field label="Suggested stack">
        <div className="flex flex-wrap gap-2">
          {d.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border px-2 py-0.5 text-xs"
              style={{ background: "rgba(60,255,122,0.08)", borderColor: "rgba(60,255,122,0.35)", color: "#3CFF7A" }}
            >{s}</span>
          ))}
        </div>
      </Field>
      <CardGrid>
        <CodeBlock title="Folder structure" lines={d.folders} />
        <CodeBlock title="API routes" lines={d.routes} />
        <CodeBlock title="Schema idea" lines={d.schema} />
        <CodeBlock title="Starter components" lines={d.components} />
      </CardGrid>
    </div>
  );
}

function CodeBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-weak">{title}</div>
      <pre
        className="mt-1 overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"
        style={{ background: "#080809", borderColor: "#2A2A2A", color: "#D8D8DC" }}
      >
{lines.map((l) => "› " + l).join("\n")}
      </pre>
    </div>
  );
}

function MarketingTab({ d }: { d: OutputData["marketing"] }) {
  return (
    <div className="space-y-4">
      <Field label="ICP">{d.icp}</Field>
      <Field label="Launch channels">
        <div className="flex flex-wrap gap-2">
          {d.channels.map((c) => (
            <span key={c} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground" style={{ background: "#181818", borderColor: "#2A2A2A" }}>{c}</span>
          ))}
        </div>
      </Field>
      <Field label="Social posts">
        <div className="space-y-2">
          {d.posts.map((p, i) => (
            <div key={i} className="rounded-lg border p-3 text-sm" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>{p}</div>
          ))}
        </div>
      </Field>
      <Field label="Outreach message">
        <div className="rounded-lg border p-3 text-sm text-muted-foreground" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>{d.outreach}</div>
      </Field>
    </div>
  );
}

function GrowthTab({ d }: { d: OutputData["growth"] }) {
  const max = Math.max(...d.months.map((m) => m.users));
  return (
    <div className="space-y-4">
      <Field label="Growth projection (active users)">
        <div className="grid grid-cols-6 items-end gap-2 rounded-xl border p-4" style={{ background: "#0c0c0e", borderColor: "#2A2A2A", minHeight: 160 }}>
          {d.months.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1.5">
              <div className="text-[10px] font-semibold" style={{ color: "#3CFF7A" }}>{m.usersLabel}</div>
              <div className="w-full overflow-hidden rounded-md" style={{ height: 100 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.users / max) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-md"
                  style={{ background: "linear-gradient(180deg,#3CFF7A,#FF2D2D)", marginTop: `${100 - (m.users / max) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-weak">{m.label}</div>
            </div>
          ))}
        </div>
      </Field>
      <Field label="Summary">{d.summary}</Field>
    </div>
  );
}

function CriticTab({ d }: { d: OutputData["critic"] }) {
  return (
    <div className="space-y-4">
      <CardGrid>
        <Field label="Weakest assumption">{d.weakest}</Field>
        <Field label="Biggest risk">{d.risk}</Field>
        <Field label="What will probably fail">{d.fail}</Field>
        <Field label="What to fix first">{d.fix}</Field>
      </CardGrid>
      <Field label="Improved version">
        <div className="rounded-lg border p-3 text-sm" style={{ background: "rgba(60,255,122,0.06)", borderColor: "rgba(60,255,122,0.35)" }}>
          {d.improved}
        </div>
      </Field>
    </div>
  );
}

function ScoreBar({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1a1a1c]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#FF2D2D,#3CFF7A)" }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold">{v}</span>
    </div>
  );
}
