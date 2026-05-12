import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { store, useStore } from "@/lib/app-store";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppGate,
});

function AppGate() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (!store.get().user) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="rounded-2xl border px-6 py-5 text-center text-sm text-muted-foreground"
          style={{ background: "#111111", borderColor: "#2A2A2A" }}
        >
          Preparing your workspace...
        </div>
      </div>
    );
  }

  return <Outlet />;
}
