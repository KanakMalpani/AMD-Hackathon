import { useNavigate } from "@tanstack/react-router";
import { store } from "@/lib/app-store";

export function useStartLaunch() {
  const navigate = useNavigate();
  return (idea = "") => {
    const loggedIn = !!store.get().user;
    if (!loggedIn) {
      if (typeof window !== "undefined" && idea) {
        sessionStorage.setItem("lmi_pending_idea", idea);
      }
      navigate({ to: "/login" });
      return;
    }
    const project = store.createProject(idea);
    navigate({ to: "/projects/$projectId/dashboard", params: { projectId: project.id } });
  };
}
