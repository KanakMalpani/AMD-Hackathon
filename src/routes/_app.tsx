import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { store } from "@/lib/app-store";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !store.get().user) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});

