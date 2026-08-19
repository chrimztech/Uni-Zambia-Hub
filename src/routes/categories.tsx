import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { FolderOpen } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse Categories — UBIRR" },
      { name: "description", content: "Browse University of Zambia resources by subject category." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories", "with-counts"],
    queryFn: async () => api.public.categories(),
  });

  return (
    <PublicLayout>
      <section className="container-page py-12">
        <h1 className="font-display text-4xl font-bold">Browse by Category</h1>
        <p className="mt-2 text-muted-foreground">Explore public resources grouped by subject area.</p>
        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No categories have been configured yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <Link
                key={c.id}
                to="/library"
                search={{ q: "", type: "all", category: c.slug } as any}
                className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <FolderOpen className="h-7 w-7 text-primary" />
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                    {c.count} {c.count === 1 ? "item" : "items"}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">{c.name}</h2>
                {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
