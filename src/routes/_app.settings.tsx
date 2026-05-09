import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout, Topbar } from "@/components/AppShell";
import { store, useStore } from "@/lib/app-store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — LaunchMyIdea AI" }] }),
  component: SettingsPage,
});

const FOCUS = ["SaaS", "AI Tool", "Creator Tool", "Education", "Local Business"];

function SettingsPage() {
  const user = useStore((s) => s.user);
  const [animation, setAnimation] = useState(user?.prefs.animation ?? "Normal");
  const [exportFormat, setExportFormat] = useState(user?.prefs.exportFormat ?? "PDF");
  const [focus, setFocus] = useState(user?.prefs.focus ?? "AI Tool");
  const [reduced, setReduced] = useState(user?.prefs.animation === "Reduced");

  function savePrefs(patch: Partial<NonNullable<typeof user>["prefs"]>) {
    if (!user) return;
    store.updateUser({ prefs: { ...user.prefs, ...patch } });
    toast.success("Preference saved.");
  }

  function reset() {
    if (typeof window !== "undefined" && window.confirm("Reset all data?")) {
      localStorage.removeItem("lmi_state_v1");
      window.location.href = "/login";
    }
  }

  return (
    <AppLayout topbar={<Topbar title="Settings" />}>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <h3 className="font-display text-sm font-semibold">Preferences</h3>
          <div className="mt-4 space-y-4">
            <Field label="Animation intensity">
              <Toggle
                options={["Normal", "Reduced"]}
                value={animation}
                onChange={(v) => {
                  setAnimation(v as any);
                  setReduced(v === "Reduced");
                  savePrefs({ animation: v as any });
                }}
              />
            </Field>
            <Field label="Default export format">
              <Toggle
                options={["PDF", "Markdown"]}
                value={exportFormat}
                onChange={(v) => {
                  setExportFormat(v as any);
                  savePrefs({ exportFormat: v as any });
                }}
              />
            </Field>
            <Field label="Preferred startup focus">
              <div className="flex flex-wrap gap-2">
                {FOCUS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFocus(f);
                      savePrefs({ focus: f });
                    }}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{
                      background: focus === f ? "rgba(255,45,45,0.12)" : "#181818",
                      borderColor: focus === f ? "rgba(255,45,45,0.5)" : "#2A2A2A",
                      color: focus === f ? "#FF8585" : "#A1A1AA",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold">Reduced motion</h3>
              <p className="mt-1 text-xs text-muted-foreground">Lower animation intensity for performance.</p>
            </div>
            <button
              onClick={() => {
                const v = !reduced;
                setReduced(v);
                setAnimation(v ? "Reduced" : "Normal");
                if (user) store.updateUser({ prefs: { ...user.prefs, animation: v ? "Reduced" : "Normal" } });
                toast.success("Preference saved.");
              }}
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ background: reduced ? "#3CFF7A" : "#2A2A2A" }}
            >
              <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: reduced ? "22px" : "2px" }} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <h3 className="font-display text-sm font-semibold">Account</h3>
          <p className="mt-1 text-xs text-muted-foreground">Manage your account credentials.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => toast("Change password coming soon.")}
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,255,255,0.3)]"
              style={{ background: "#181818", borderColor: "#2A2A2A" }}
            >
              Change password
            </button>
            <button
              onClick={() => toast("Account deletion coming soon.")}
              className="rounded-lg border px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-[rgba(255,45,45,0.08)]"
              style={{ borderColor: "rgba(255,45,45,0.5)" }}
            >
              Delete account
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
          <h3 className="font-display text-sm font-semibold">Reset data</h3>
          <p className="mt-1 text-xs text-muted-foreground">Clear all projects.</p>
          <button onClick={reset} className="mt-3 rounded-lg border px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-[rgba(255,45,45,0.08)]" style={{ borderColor: "rgba(255,45,45,0.5)" }}>
            Reset everything
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-weak">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg border p-0.5" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="rounded-md px-3 py-1 text-xs font-medium" style={{
          background: value === o ? "rgba(255,45,45,0.15)" : "transparent",
          color: value === o ? "#FF8585" : "#A1A1AA",
        }}>{o}</button>
      ))}
    </div>
  );
}
