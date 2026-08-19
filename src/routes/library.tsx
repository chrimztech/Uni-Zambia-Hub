import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, toApiUrl } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { formatDate, accessLabel, contentTypeLabel } from "@/lib/format";
import { useState } from "react";
import {
  Search, X, Building2, SlidersHorizontal,
  Calendar, ChevronRight, Library as LibraryIcon,
} from "lucide-react";
import { ResourceThumbnail } from "@/components/resource-thumbnail";

const TYPES = [
  "all", "article", "report", "policy", "guidelines", "standards",
  "manual", "training_material", "presentation", "case_study",
  "journal_article", "thesis", "dataset", "pdf", "educational",
  "digitized", "announcement",
] as const;

export const Route = createFileRoute("/library")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    type: typeof s.type === "string" ? s.type : "all",
    category: typeof s.category === "string" ? s.category : "",
    department: typeof s.department === "string" ? s.department : "",
  }),
  head: () => ({
    meta: [
      { title: "Resource Library — UNZA Sanitation Hub" },
      { name: "description", content: "Browse all sanitation research, policy documents, training materials, and reports from the University of Zambia." },
    ],
  }),
  component: Library,
});

function Library() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q);
  const [type, setType] = useState(search.type);
  const [department, setDepartment] = useState(search.department);
  const [showFilters, setShowFilters] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.public.departments(),
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["library", q, type, search.category, department],
    queryFn: async () => api.public.resources({
      q,
      type,
      category: search.category || undefined,
      department: department || undefined,
    }),
  });

  const activeFilterCount = [
    q, type !== "all" ? type : "", search.category, department,
  ].filter(Boolean).length;

  const clearAll = () => {
    setQ("");
    setType("all");
    setDepartment("");
  };

  return (
    <PublicLayout>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="container-page py-12">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Resource Library</span>
          </div>
          <h1 className="font-display text-4xl font-bold">Resource Library</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Browse published research, policy documents, training materials, and reports from the UNZA Sanitation Hub.
          </p>

          {/* Search + filter bar */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  suppressHydrationWarning
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, keywords, authors…"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                {q && (
                  <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${showFilters ? "border-primary bg-primary/8 text-primary" : "border-border bg-background text-foreground/70 hover:bg-secondary"}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilterCount}</span>
                )}
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-4 shadow-sm">
                <select
                  suppressHydrationWarning
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t === "all" ? "All content types" : contentTypeLabel[t] ?? t}</option>
                  ))}
                </select>
                {departments && departments.length > 0 && (
                  <select
                    suppressHydrationWarning
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">All departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" /> Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {(search.category || department) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {search.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Building2 className="h-3 w-3" />
                  Category: {search.category}
                </span>
              )}
              {department && departments && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Building2 className="h-3 w-3" />
                  {departments.find((d) => d.id === department)?.name}
                  <button onClick={() => setDepartment("")} className="ml-1 hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="container-page py-10">
        {/* Result count */}
        {!isLoading && data && (
          <div className="mb-6 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{data.length}</span> resource{data.length !== 1 ? "s" : ""} found
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-44 animate-pulse bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-20 text-center">
            <LibraryIcon className="h-12 w-12 text-muted-foreground/25" />
            <h3 className="mt-4 font-display text-lg font-semibold">No resources found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search terms or filters.</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-secondary">
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data!.map((r) => (
              <Link
                key={r.id}
                to="/resource/$slug"
                params={{ slug: r.slug }}
                className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary hover:shadow-xl hover:-translate-y-1"
              >
                <ResourceThumbnail
                  thumbnailUrl={r.thumbnail_url ? toApiUrl(r.thumbnail_url) : null}
                  contentType={r.content_type}
                  title={r.title}
                  className="h-44 w-full"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {formatDate(r.published_at)}
                    <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">{accessLabel[r.access_level]}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {r.summary ?? "—"}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    View resource <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
