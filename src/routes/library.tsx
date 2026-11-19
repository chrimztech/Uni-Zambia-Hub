import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { api, toApiUrl } from "@/lib/api";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { formatDate, accessLabel, contentTypeLabel } from "@/lib/format";
import { useEffect, useState } from "react";
import {
  Search,
  X,
  Building2,
  SlidersHorizontal,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Library as LibraryIcon,
} from "lucide-react";
import { ResourceThumbnail } from "@/components/resource-thumbnail";
import { StarRatingDisplay } from "@/components/star-rating";

const TYPES = [
  "all",
  "article",
  "report",
  "policy",
  "guidelines",
  "standards",
  "manual",
  "training_material",
  "presentation",
  "case_study",
  "journal_article",
  "thesis",
  "dataset",
  "pdf",
  "educational",
  "digitized",
  "announcement",
] as const;

const PAGE_SIZE = 18;
const SEARCH_DEBOUNCE_MS = 350;

type LibrarySearch = { q: string; type: string; category: string; department: string; page: number };

// Matches the query key the component computes on first render (its filter state starts out
// equal to the route search params) — the loader prefetch below is then served from cache on
// initial mount instead of triggering a second client-side round trip after SSR.
const libraryQuery = (search: LibrarySearch) =>
  queryOptions({
    queryKey: ["library", search.q, search.type, search.category, search.department, search.page],
    queryFn: async () =>
      api.public.resources({
        q: search.q,
        type: search.type,
        category: search.category || undefined,
        department: search.department || undefined,
        page: search.page,
        pageSize: PAGE_SIZE,
      }),
  });

export const Route = createFileRoute("/library")({
  validateSearch: (s: Record<string, unknown>): LibrarySearch => ({
    q: typeof s.q === "string" ? s.q : "",
    type: typeof s.type === "string" ? s.type : "all",
    category: typeof s.category === "string" ? s.category : "",
    department: typeof s.department === "string" ? s.department : "",
    page: typeof s.page === "number" && s.page >= 0 ? Math.floor(s.page) : 0,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(libraryQuery(deps)),
  head: () => ({
    meta: [
      { title: "Resource Library — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Browse all sanitation research, policy documents, training materials, and reports from the University of Zambia.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [inputValue, setInputValue] = useState(search.q);
  const [showFilters, setShowFilters] = useState(false);

  // Keep the text box in sync if the query changes from elsewhere (e.g. "Clear filters",
  // browser back/forward) without fighting the user's own typing.
  useEffect(() => {
    setInputValue(search.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q]);

  // Debounce typed input before it becomes a real search — avoids firing a request (and a
  // URL update) on every keystroke, which is how this used to behave.
  useEffect(() => {
    if (inputValue === search.q) return;
    const t = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: inputValue, page: 0 }), replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.public.departments(),
    staleTime: Infinity,
  });

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...libraryQuery(search),
    placeholderData: (prev) => prev,
  });

  const setType = (type: string) => navigate({ search: (prev) => ({ ...prev, type, page: 0 }), replace: true });
  const setDepartment = (department: string) => navigate({ search: (prev) => ({ ...prev, department, page: 0 }), replace: true });
  const setPage = (page: number) => navigate({ search: (prev) => ({ ...prev, page }) });

  const activeFilterCount = [search.q, search.type !== "all" ? search.type : "", search.category, search.department].filter(
    Boolean,
  ).length;

  const clearAll = () => {
    setInputValue("");
    navigate({ search: { q: "", type: "all", category: "", department: "", page: 0 } });
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = data?.page ?? search.page;
  const rangeStart = total === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, (currentPage + 1) * PAGE_SIZE);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Knowledge base"
        title="Resource library"
        description="Search trusted sanitation research, policy documents, training materials and reports from the UNZA Sanitation Hub."
      >
        <div className="mt-7 flex max-w-4xl flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="library-search" className="sr-only">
                Search library resources
              </label>
              <input
                id="library-search"
                type="search"
                suppressHydrationWarning
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by title, keyword or author"
                className="h-12 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-sm shadow-sm outline-none transition-shadow focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
              {inputValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setInputValue("");
                    navigate({ search: (prev) => ({ ...prev, q: "", page: 0 }), replace: true });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-bold shadow-sm transition-colors ${showFilters ? "border-primary/30 bg-primary text-white" : "border-border bg-white text-foreground/70 hover:bg-secondary"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-white p-4 shadow-sm">
              <select
                suppressHydrationWarning
                value={search.type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All content types" : (contentTypeLabel[t] ?? t)}
                  </option>
                ))}
              </select>
              {departments && departments.length > 0 && (
                <select
                  suppressHydrationWarning
                  value={search.department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">All departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {(search.category || search.department) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {search.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Building2 className="h-3 w-3" />
                Category: {search.category}
              </span>
            )}
            {search.department && departments && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Building2 className="h-3 w-3" />
                {departments.find((d) => d.id === search.department)?.name}
                <button onClick={() => setDepartment("")} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </PageHero>

      {/* Results */}
      <section className="container-page py-12 lg:py-16">
        {/* Result count */}
        {!isLoading && data && (
          <div className="mb-6 text-sm text-muted-foreground">
            {total === 0 ? (
              "0 resources found"
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{rangeStart}–{rangeEnd}</span> of{" "}
                <span className="font-semibold text-foreground">{total}</span> resource{total !== 1 ? "s" : ""}
              </>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface-card overflow-hidden">
                <div className="h-44 animate-pulse bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-secondary/25 py-20 text-center">
            <LibraryIcon className="h-12 w-12 text-muted-foreground/25" />
            <h3 className="mt-4 font-display text-lg font-semibold">No resources found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
              >
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
          >
            {data!.items.map((r) => (
              <Link
                key={r.id}
                to="/resource/$slug"
                params={{ slug: r.slug }}
                className="surface-card interactive-card group flex flex-col overflow-hidden"
              >
                <ResourceThumbnail
                  thumbnailUrl={r.thumbnail_url ? toApiUrl(r.thumbnail_url) : null}
                  contentType={r.content_type}
                  title={r.title}
                  className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.025]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {r.publication_year ?? formatDate(r.published_at)}
                    <span className="ml-auto rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                      {accessLabel[r.access_level]}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {r.summary ?? "—"}
                  </p>
                  {r.review_count > 0 && (
                    <div className="mt-2">
                      <StarRatingDisplay rating={r.average_rating} count={r.review_count} />
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    View resource <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && total > PAGE_SIZE && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </section>
    </PublicLayout>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  // A windowed page list: first, last, current ± 1, with "…" filling any gaps — keeps the
  // control compact and readable even when there are dozens of pages.
  const pages: (number | "gap")[] = [];
  for (let p = 0; p < totalPages; p++) {
    if (p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  const btn = "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Previous page"
        className={`${btn} border border-border bg-white text-foreground/70 hover:bg-secondary disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${btn} ${p === currentPage ? "bg-primary text-white" : "border border-border bg-white text-foreground/70 hover:bg-secondary"}`}
          >
            {p + 1}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        aria-label="Next page"
        className={`${btn} border border-border bg-white text-foreground/70 hover:bg-secondary disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
