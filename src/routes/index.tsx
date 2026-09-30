import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, toApiUrl, type HeroBanner } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  GraduationCap,
  Library,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { formatDate, accessLabel } from "@/lib/format";
import { ResourceThumbnail } from "@/components/resource-thumbnail";

const featuredQuery = queryOptions({
  queryKey: ["public", "featured"],
  queryFn: async () => api.public.home(),
});

const bannersQuery = queryOptions({
  queryKey: ["public", "banners"],
  queryFn: async () => api.public.banners(),
  staleTime: 1000 * 60 * 5,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(featuredQuery),
      context.queryClient.ensureQueryData(bannersQuery),
    ]),
  head: () => ({
    meta: [
      { title: "UNZA Sanitation Hub — Knowledge for a Healthier Zambia" },
      {
        name: "description",
        content:
          "The University of Zambia knowledge platform for sanitation research, policy, training and monitoring.",
      },
      { property: "og:title", content: "UNZA Sanitation Hub & Laboratory Repository" },
      {
        property: "og:description",
        content:
          "A national knowledge platform connecting sanitation science, policy and communities across Zambia.",
      },
    ],
  }),
  component: Home,
});

function StatPill({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-white/10 px-4 py-5 sm:px-5 lg:border-r last:lg:border-r-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-xl font-bold leading-none text-white tabular-nums sm:text-2xl">
          {value.toLocaleString()}
        </div>
        <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.13em] text-white/45 sm:text-[10px]">
          {label}
        </div>
      </div>
    </div>
  );
}

const SLIDE_MS = 5500;

function BannerSlider({ banners }: { banners: HeroBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const count = banners.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent((position) => (position + 1) % count);
      setAnimKey((key) => key + 1);
    }, SLIDE_MS);
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const showSlide = useCallback(
    (index: number) => {
      setCurrent(index);
      setAnimKey((key) => key + 1);
      startTimer();
    },
    [startTimer],
  );

  const next = () => showSlide((current + 1) % count);
  const previous = () => showSlide((current - 1 + count) % count);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured work"
    >
      <style>{`
        @keyframes heroKenBurns { from { transform: scale(1); } to { transform: scale(1.06); } }
        @keyframes heroProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      {banners.map((banner, index) => (
        <div
          key={banner.id}
          aria-hidden={index !== current}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          {banner.image_url && (
            <img
              src={toApiUrl(banner.image_url)}
              alt=""
              className="h-full w-full object-cover"
              style={
                index === current
                  ? { animation: `heroKenBurns ${SLIDE_MS}ms ease-out both` }
                  : undefined
              }
            />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,22,14,.94)_0%,rgba(5,28,18,.84)_47%,rgba(4,18,12,.50)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-transparent to-black/20" />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Previous featured image"
            className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next featured image"
            className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-5 z-20">
            <div className="container-page flex max-w-xs gap-1.5 lg:max-w-7xl">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => showSlide(index)}
                  aria-label={`Show featured image ${index + 1}`}
                  aria-current={index === current ? "true" : undefined}
                  className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25 lg:max-w-16"
                >
                  {index < current && <span className="absolute inset-0 bg-white/70" />}
                  {index === current && (
                    <span
                      key={animKey}
                      className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                      style={{ animation: `heroProgress ${SLIDE_MS}ms linear forwards` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const { data } = useSuspenseQuery(featuredQuery);
  const { data: banners } = useSuspenseQuery(bannersQuery);
  const stats = data?.stats;

  const focusAreas = [
    {
      icon: BookOpenCheck,
      title: "Research & evidence",
      description: "Reports, policy briefs and datasets",
      to: "/library",
      search: { q: "", type: "research", category: "", department: "" },
    },
    {
      icon: GraduationCap,
      title: "Training & capacity",
      description: "Programmes and learning materials",
      to: "/training",
    },
    {
      icon: MapPin,
      title: "Demonstration sites",
      description: "Technologies operating across Zambia",
      to: "/sites",
    },
  ];

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden bg-brand-deep text-white">
        {banners.length > 0 ? (
          <BannerSlider banners={banners} />
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_28%,rgba(243,149,12,.18),transparent_26%),linear-gradient(118deg,var(--brand-deep)_0%,var(--brand-deep)_54%,black_100%)]" />
            <div className="absolute -right-20 top-12 h-[520px] w-[520px] rounded-full border border-white/5" />
            <div className="absolute right-20 top-32 h-[360px] w-[360px] rounded-full border border-white/5" />
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.035]"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <pattern id="hero-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                  <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>
        )}

        <div className="container-page relative z-10 grid min-h-[610px] items-center gap-12 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:py-20 xl:gap-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-accent backdrop-blur-sm sm:text-[11px]">
              <FlaskConical className="h-3.5 w-3.5" />
              Decentralized sanitation systems
            </div>

            <h1 className="text-balance font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]">
              Knowledge that moves sanitation <span className="text-accent">forward.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
              Zambia’s platform for research, policy, training and field-tested solutions—connecting
              evidence with the people putting it into practice.
            </p>

            <form
              action="/search"
              className="mt-8 flex max-w-2xl items-center rounded-xl bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.25)] ring-1 ring-white/20 transition-shadow focus-within:ring-2 focus-within:ring-accent"
              suppressHydrationWarning
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="home-search" className="sr-only">
                Search the knowledge repository
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Search reports, research and training materials"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-brand-deep-hover sm:px-6"
                suppressHydrationWarning
              >
                <span className="hidden sm:inline">Search library</span>
                <span className="sm:hidden">Search</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/library"
                search={{ q: "", type: "all", category: "", department: "" }}
                className="inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-accent"
              >
                <Library className="h-4 w-4 text-accent" /> Browse all resources
              </Link>
              <Link
                to="/sites"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition-colors hover:text-white"
              >
                View demonstration sites <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside
            className="hidden rounded-2xl border border-white/15 bg-white/[0.08] p-2 shadow-2xl backdrop-blur-md lg:block"
            aria-label="Explore focus areas"
          >
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5">
                <img src="/logo.png" alt="" className="h-full w-auto object-contain" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                  Explore the Hub
                </p>
                <p className="mt-1 text-sm text-white/55">Start with an area of work</p>
              </div>
            </div>
            <div className="space-y-1">
              {focusAreas.map((area) => (
                <Link
                  key={area.title}
                  to={area.to}
                  search={"search" in area ? area.search : undefined}
                  className="group flex items-center gap-3 rounded-xl border border-transparent bg-black/10 p-4 transition-colors hover:border-white/10 hover:bg-white/10"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <area.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{area.title}</span>
                    <span className="mt-0.5 block text-xs text-white/45">{area.description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {stats && (
        <section className="bg-brand-deep" aria-label="Repository statistics">
          <div className="container-page grid grid-cols-2 lg:grid-cols-6">
            <StatPill value={stats.total_resources} label="Resources" icon={FileText} />
            <StatPill value={stats.demonstration_sites} label="Demo sites" icon={MapPin} />
            <StatPill value={stats.active_sites} label="Active sites" icon={BarChart3} />
            <StatPill value={stats.published_events} label="Events" icon={Calendar} />
            <StatPill value={stats.training_materials} label="Training" icon={GraduationCap} />
            <StatPill value={stats.research_outputs} label="Research" icon={BookOpen} />
          </div>
        </section>
      )}

      <section className="container-page py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="section-kicker">Our work</p>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
              From research to real-world impact
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              The Hub brings knowledge, skills and field evidence together so better sanitation
              decisions can be made faster.
            </p>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/75"
            >
              Learn about the Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FlaskConical,
                number: "01",
                title: "Research & innovation",
                description:
                  "Locally relevant studies on sanitation technology, sustainability and public health.",
                to: "/library",
                search: { q: "", type: "research", category: "", department: "" },
              },
              {
                icon: GraduationCap,
                number: "02",
                title: "Capacity building",
                description:
                  "Practical training and learning materials for students, practitioners and communities.",
                to: "/training",
              },
              {
                icon: BarChart3,
                number: "03",
                title: "Monitoring & evaluation",
                description:
                  "Frameworks and evidence for tracking sanitation programmes and their outcomes.",
                to: "/library",
                search: { q: "", type: "report", category: "", department: "" },
              },
              {
                icon: MapPin,
                number: "04",
                title: "Demonstration sites",
                description:
                  "Living laboratories showcasing decentralized sanitation solutions across Zambia.",
                to: "/sites",
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                search={"search" in item ? item.search : undefined}
                className="surface-card interactive-card group relative overflow-hidden p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl font-bold text-primary/10">
                    {item.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                  Explore{" "}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-white py-20 lg:py-24">
        <div className="container-page">
          <SectionHeading
            kicker="Knowledge base"
            title="Latest resources"
            description="New research, guidance and learning materials from the Hub and its partners."
            action={{ label: "View all resources", to: "/library" }}
          />

          {(data?.resources?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Library}
              title="Resources are being prepared"
              description="Published resources will appear here as they are added to the library."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(data?.resources ?? []).map((resource) => (
                <Link
                  key={resource.id}
                  to="/resource/$slug"
                  params={{ slug: resource.slug }}
                  className="surface-card interactive-card group flex flex-col overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <ResourceThumbnail
                      thumbnailUrl={
                        resource.thumbnail_url ? toApiUrl(resource.thumbnail_url) : null
                      }
                      contentType={resource.content_type}
                      title={resource.title}
                      className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm">
                      {accessLabel[resource.access_level]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" />{" "}
                      {formatDate(resource.published_at)}
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                      {resource.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {resource.summary ??
                        "Open this resource to view the full details and available files."}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">
                      View resource{" "}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-20 lg:py-24">
        <SectionHeading
          kicker="Calendar"
          title="Upcoming events"
          description="Join workshops, training sessions and conversations advancing sanitation practice."
          action={{ label: "See all events", to: "/events" }}
        />

        {(data?.events?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="New workshops and events will be posted here when registration opens."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {(data?.events ?? []).map((event) => (
              <div key={event.id} className="surface-card flex flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Calendar className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {formatDate(event.start_date)}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-snug">{event.title}</h3>
                {event.venue && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {event.venue}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden bg-brand-deep py-20 text-white lg:py-24">
        <div
          className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="container-page relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              Open knowledge platform
            </p>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Built for everyone working toward safer sanitation.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Researchers, practitioners, policy makers, students and community organisations can
              discover credible resources in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/library"
                search={{ q: "", type: "all", category: "", department: "" }}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                <Library className="h-4 w-4" /> Explore the library
              </Link>
              <Link
                to="/auth"
                search={{ redirect: "/" }}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 text-sm font-bold transition-colors hover:bg-white/10"
              >
                <Users className="h-4 w-4" /> Create an account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: FileText, label: "Policy documents" },
              { icon: FlaskConical, label: "Research outputs" },
              { icon: GraduationCap, label: "Training materials" },
              { icon: ShieldCheck, label: "Standards & guidance" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.06] p-4 sm:p-5"
              >
                <item.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-bold text-white/85">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action: { label: string; to: "/library" | "/events" };
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action.to === "/library" ? (
        <Link
          to="/library"
          search={{ q: "", type: "all", category: "", department: "" }}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/75"
        >
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link
          to="/events"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/75"
        >
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/30 px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
