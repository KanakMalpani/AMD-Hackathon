import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, Topbar } from "@/components/AppShell";
import { store, useStore } from "@/lib/app-store";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile - Autonomous Startup-in-a-Box" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useStore((s) => s.user);
  const projects = useStore((s) => s.projects);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
    }
  }, [user?.email]);

  if (!user) return null;
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const ready = projects.filter((p) => p.status === "Launch Ready").length;
  const avg = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.launchReadiness, 0) / projects.length)
    : 0;
  const best = projects.length
    ? Math.max(...projects.map((p) => p.launchReadiness))
    : 0;

  function save() {
    store.updateUser({ name, bio });
    toast.success("Profile updated.");
  }

  const stats = [
    { label: "Projects Created", value: projects.length },
    { label: "Simulation Runs", value: ready },
    { label: "Avg Readiness", value: avg },
    { label: "Best Score", value: best },
  ];

  return (
    <AppLayout topbar={<Topbar title="Profile" />}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-5">
        <motion.div
          whileHover={{ boxShadow: "0 0 32px rgba(255,45,45,0.55)" }}
          className="grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#FF2D2D,#B80000)" }}
        >
          {initials}
        </motion.div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary" style={{ borderColor: "rgba(255,45,45,0.5)", background: "rgba(255,45,45,0.08)" }}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border p-4"
            style={{ background: "#111111", borderColor: "#2A2A2A" }}
          >
            <div className="text-[10px] uppercase tracking-wider text-weak">{s.label}</div>
            <CountUp to={Number(s.value)} />
          </motion.div>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Personal Info">
          <div className="space-y-3">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Email">
              <input value={user.email} disabled className={inputCls + " opacity-60"} style={inputStyle} />
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={inputCls + " min-h-[90px] resize-none"} style={inputStyle} />
            </Field>
            <button onClick={save} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#FF2D2D" }}>
              <Save className="h-3.5 w-3.5" /> Save changes
            </button>
          </div>
        </Section>

        <Section title="Recent Projects">
          {projects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No startups yet.</div>
          ) : (
            <ul className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ background: "#0c0c0e", borderColor: "#2A2A2A" }}>
                  <span className="truncate">{p.title}</span>
                  <span className="text-xs" style={{ color: p.status === "Launch Ready" ? "#3CFF7A" : "#FF8585" }}>{p.launchReadiness}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AppLayout>
  );
}

const inputCls = "w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-weak outline-none focus:border-[rgba(255,45,45,0.5)]";
const inputStyle = { background: "#0c0c0e", borderColor: "#2A2A2A" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-weak">{label}</div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{ background: "#111111", borderColor: "#2A2A2A" }}
    >
      <h3 className="mb-3 font-display text-sm font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}


function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <div className="mt-1 font-display text-2xl font-bold">{v}</div>;
}
