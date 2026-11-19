import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { ArrowRight, FolderOpen } from "lucide-react";

const categoriesQuery = queryOptions({
  queryKey: ["categories", "with-counts"],
  queryFn: async () => api.public.categories(),
});

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  head: () => ({
    meta: [
      { title: "Browse Categories — UNZA Sanitation Hub" },
      {
        name: "description",
        content: "Browse University of Zambia sanitation resources by subject area.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(categoriesQuery);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Browse topics"
        title="Explore by category"
        description="Go directly to research and practical guidance organised around the subjects that matter to your work."
      />

      <section className="container-page py-12 lg:py-16">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-14 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-primary/35" />
            <h2 className="mt-4 font-display text-lg font-bold">No categories yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Categories will appear here as the library is organised.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((category, index) => (
              <Link
                key={category.id}
                to="/library"
                search={{ q: "", type: "all", category: category.slug, department: "", page: 0 }}
                className="surface-card interactive-card group flex min-h-44 flex-col p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <FolderOpen className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl font-bold text-primary/10">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-bold transition-colors group-hover:text-primary">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-5 text-xs font-bold text-primary">
                  <span>
                    {category.count} {category.count === 1 ? "resource" : "resources"}
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
