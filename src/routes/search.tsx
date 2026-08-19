import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  beforeLoad: ({ search }) => { throw redirect({ to: "/library", search: { q: search.q, type: "all" } as any }); },
});
