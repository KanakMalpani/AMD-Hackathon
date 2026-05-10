import { Link, useRouterState, useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Rocket,
  FolderKanban,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Activity,
  Megaphone,
  BarChart3,
  ChevronDown,
  Play,
  Sparkles,
  Network,
} from "lucide-react";
import { store, useStore, type Project } from "@/lib/app-store";
import { useState, type ReactNode } from "react";

const projectNav = [
  { key: "dashboard", label: "Overview", icon: LayoutDashboard },
  { key: "prompts", label: "Brief", icon: Sparkles },
  { key: "simulation", label: "Simulation", icon: Activity },
  { key: "nodes", label: "Nodes", icon: Network },
  { key: "marketing", label: "Go-To-Market", icon: Megaphone },
  { key: "statistics", label: "Insights", icon: BarChart3 },
] as const;

function ProjectSwitcher({ activeId }: { activeId?: string }) {
  const projects = useStore((s) => s.projects);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const active = projects.find((p) => p.id === activeId);

  return (
    <div className="relative px-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors hover:border-[rgba(255,45,45,0.5)]"
        style={{ background: "#0d0d0f", borderColor: "#2A2A2A" }}
      >
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-weak">Startup</div>
          <div className="truncate text-sm font-semibold">
            {active?.title ?? "Select a workspace"}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-weak" />
      </button>
      {open && (
        <div
          className="absolute left-3 right-3 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg border p-1 shadow-2xl"
          style={{ background: "#111111", borderColor: "#2A2A2A" }}
        >
          {projects.length === 0 && (
            <div className="px-3 py-3 text-xs text-weak">No workspaces yet.</div>
          )}
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setOpen(false);
                navigate({
                  to: "/projects/$projectId/dashboard",
                  params: { projectId: p.id },
                });
              }}
              className={
                "block w-full truncate rounded-md px-3 py-2 text-left text-xs transition-colors " +
                (p.id === activeId ? "text-primary" : "text-foreground hover:bg-[#181818]")
              }
              style={
                p.id === activeId
                  ? { background: "rgba(255,45,45,0.08)" }
                  : undefined
              }
            >
              {p.title}
            </button>
          ))}
          <Link
            to="/projects"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-[#181818]"
          >
            View all workspaces →
          </Link>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ projectId }: { projectId?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const recent = useStore((s) => s.projects[0]);
  const activeId = projectId ?? recent?.id;

  function logout() {
    store.logout();
    if (typeof window !== "undefined") window.location.href = "/login";
    else navigate({ to: "/login" });
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r md:flex"
      style={{
        borderColor: "#2A2A2A",
        background: "rgba(10,10,12,0.85)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Link to="/" className="flex items-center gap-2 px-5 py-5">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: "#FF2D2D" }}
        >
          <Rocket className="h-4 w-4 text-white" />
        </span>
        <span className="font-display text-sm font-semibold tracking-tight">
          LaunchMyIdea<span className="text-primary"> AI</span>
        </span>
      </Link>

      <ProjectSwitcher activeId={activeId} />

      {activeId && (
        <nav className="mt-4 space-y-1 px-3">
          <div className="mb-2 px-3 text-[10px] uppercase tracking-wider text-weak">
            Workspace
          </div>
          {projectNav.map(({ key, label, icon: Icon }) => {
            const target = `/projects/${activeId}/${key === "dashboard" ? "dashboard" : key}`;
            const active = pathname === target;
            return (
              <SideLink
                key={key}
                to={target}
                label={label}
                Icon={Icon}
                active={active}
              />
            );
          })}
        </nav>
      )}

      <nav className="mt-4 flex-1 space-y-1 px-3">
        <SideLink
          to="/projects"
          label="Startups"
          Icon={FolderKanban}
          active={pathname === "/projects"}
        />
        <div className="my-3 px-3 text-[10px] uppercase tracking-wider text-weak">
          Account
        </div>
        <SideLink to="/profile" label="Profile" Icon={User} active={pathname === "/profile"} />
        <SideLink
          to="/settings"
          label="Settings"
          Icon={Settings}
          active={pathname === "/settings"}
        />
      </nav>

      <button
        onClick={logout}
        className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-[rgba(255,45,45,0.08)] hover:text-primary"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}

function SideLink({
  to,
  label,
  Icon,
  active,
  dim,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  dim?: boolean;
}) {
  return (
    <motion.div whileHover={{ x: 4 }}>
      <Link
        to={to}
        className={
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
          (active
            ? "text-foreground"
            : dim
              ? "text-weak"
              : "text-muted-foreground hover:text-foreground")
        }
        style={
          active
            ? {
                background: "rgba(255,45,45,0.10)",
                boxShadow: "inset 2px 0 0 #FF2D2D, 0 0 24px rgba(255,45,45,0.15)",
              }
            : undefined
        }
      >
        <Icon className={"h-4 w-4 " + (active ? "text-primary" : "")} />
        {label}
      </Link>
    </motion.div>
  );
}

export function Topbar({
  title,
  project,
  onRunSimulation,
}: {
  title?: string;
  project?: Project;
  onRunSimulation?: () => void;
}) {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);

  function newProject() {
    const p = store.createProject("");
    navigate({ to: "/projects/$projectId/dashboard", params: { projectId: p.id } });
  }

  const initials = user
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const ready = project?.launchReadiness ?? 0;
  const isReady = project?.status === "Launch Ready";

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6"
      style={{
        borderColor: "#2A2A2A",
        background: "rgba(8,8,8,0.75)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {project ? (
          <>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-weak">Startup</div>
              <div className="truncate font-display text-sm font-semibold">{project.title}</div>
            </div>
            <span
              className="hidden rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider sm:inline"
              style={{
                background: isReady ? "rgba(60,255,122,0.12)" : "rgba(255,45,45,0.10)",
                color: isReady ? "#3CFF7A" : "#FF8585",
                border: `1px solid ${isReady ? "rgba(60,255,122,0.4)" : "rgba(255,45,45,0.4)"}`,
              }}
            >
              {project.status}
            </span>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[10px] uppercase tracking-wider text-weak">Readiness</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1a1a1c]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${ready}%`,
                    background: isReady
                      ? "linear-gradient(90deg,#FF2D2D,#3CFF7A)"
                      : "linear-gradient(90deg,#FF2D2D,#FF8585)",
                  }}
                />
              </div>
              <span className="text-xs font-semibold">{ready}</span>
            </div>
          </>
        ) : (
          <h1 className="font-display text-lg font-semibold tracking-tight">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRunSimulation && (
          <button
            onClick={onRunSimulation}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 sm:inline-flex"
            style={{
              background: "linear-gradient(135deg,#FF2D2D,#FF5A5A)",
              boxShadow: "0 0 18px rgba(255,45,45,0.35)",
            }}
          >
            <Play className="h-3.5 w-3.5" /> Run Simulation
          </button>
        )}
        <button
          onClick={newProject}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:border-[rgba(255,45,45,0.5)]"
          style={{ background: "#181818", borderColor: "#2A2A2A" }}
        >
          <Rocket className="h-3.5 w-3.5 text-primary" />
          New Workspace
        </button>
        <Link
          to="/profile"
          className="grid h-9 w-9 place-items-center rounded-full border text-xs font-semibold transition-shadow hover:shadow-[0_0_18px_rgba(255,45,45,0.45)]"
          style={{ background: "#181818", borderColor: "#2A2A2A" }}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

export function AppLayout({
  children,
  topbar,
  projectId,
}: {
  children: ReactNode;
  topbar: ReactNode;
  projectId?: string;
}) {
  // Try to derive projectId from URL params if not passed
  const params = useParams({ strict: false }) as { projectId?: string };
  const id = projectId ?? params?.projectId;
  return (
    <div className="min-h-screen">

      <Sidebar projectId={id} />
      <div className="md:pl-64">
        {topbar}
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
