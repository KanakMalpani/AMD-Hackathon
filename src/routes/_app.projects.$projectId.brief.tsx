import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/projects/$projectId/brief")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/projects/$projectId/prompts",
      params: { projectId: params.projectId },
    });
  },
});
