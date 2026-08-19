import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { api, toApiUrl, type HeroBanner } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import {
  ArrowRight, Search, BookOpen, FileText, GraduationCap,
  Calendar, MapPin, FlaskConical, BarChart3, Users,
  ChevronRight, Library, ShieldCheck, ChevronLeft,
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
  head: () => ({
    meta: [
      { title: "UNZA Sanitation Hub — Decentralized Sanitation Systems" },
      {
        name: "description",
        content:
          "Centre of excellence for monitoring, evaluation, and research in decentralized sanitation systems at the University of Zambia.",
      },
      { property: "og:title", content: "UNZA Sanitation Hub & Laboratory Repository" },
      {
        property: "og:description",
        content:
          "National knowledge platform for sanitation policy, research, training, and monitoring in Zambia.",
      },
    ],
  }),
  loader: async () => {},
  component: Home,
});

function StatPill({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 text-white">
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      <div>
        <div className="font-display text-2xl font-bold leading-none tabular-nums">{value.toLocaleString()}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/50">{label}</div>
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
      setCurrent(c => (c + 1) % count);
      setAnimKey(k => k + 1);
    }, SLIDE_MS);
  }, [count]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % count);
    setAnimKey(k => k + 1);
    startTimer();
  }, [count, startTimer]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + count) % count);
    setAnimKey(k => k + 1);
    startTimer();
  }, [count, startTimer]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey(k => k + 1);
    startTimer();
  }, [startTimer]);

  return (
    <>
      <style>{`
        @keyframes heroKenBurns { from { transform: scale(1); } to { transform: scale(1.07); } }
        @keyframes heroProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
      <div className="absolute inset-0 overflow-hidden">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === current ? 1 : 0 }}
          >
            {b.image_url && (
              <img
                src={toApiUrl(b.image_url)}
                alt={b.title}
                className="h-full w-full object-cover"
                style={idx === current
                  ? { animation: `heroKenBurns ${SLIDE_MS}ms ease-out both` }
                  : undefined}
              />
            )}
          </div>
        ))}

        {/* Dual-layer gradient: left text area + full bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

        {/* Slide subtitle */}
        {banners[current]?.subtitle && (
          <div className="absolute bottom-14 left-0 right-0 z-10 pointer-events-none">
            <div className="container-page">
              <p className="text-sm italic text-white/60">{banners[current].subtitle}</p>
            </div>
          </div>
        )}

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button onClick={prev} aria-label="Previous slide"
              className="absolute left-5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:border-white/40 transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} aria-label="Next slide"
              className="absolute right-5 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:border-white/40 transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Progress strip indicators */}
        {count > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-10 flex gap-1.5 px-6">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
              >
                {idx < current && (
                  <span className="absolute inset-0 rounded-full bg-white/70" />
                )}
                {idx === current && (
                  <span
                    key={animKey}
                    className="absolute inset-y-0 left-0 w-full rounded-full bg-white origin-left"
                    style={{ animation: `heroProgress ${SLIDE_MS}ms linear forwards` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Home() {
  const { data } = useQuery(featuredQuery);
  const { data: banners = [] } = useQuery(bannersQuery);
  const stats = data?.stats;
  const hasBanners = banners.length > 0;

  return (
    <PublicLayout>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: "640px" }}>

        {/* Background */}
        {hasBanners ? (
          <BannerSlider banners={banners} />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(145deg, #0d3320 0%, #092a1a 45%, #061e14 80%, #040e0a 100%)" }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-20 h-[600px] w-[600px] rounded-full bg-accent/6 blur-3xl" />
              <div className="absolute bottom-0 left-1/4 h-[350px] w-[450px] rounded-full bg-white/3 blur-3xl" />
              <svg className="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                    <path d="M 56 0 L 0 0 0 56" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>
            </div>
          </div>
        )}

        {/* Content — two columns on desktop */}
        <div
          className="container-page relative z-10 grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24"
          style={{ minHeight: "580px" }}
        >
          {/* ── Left: text content ── */}
          <div>
            {/* Discipline tag */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent/15 px-3 py-1 backdrop-blur-sm">
                <FlaskConical className="h-3 w-3 text-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">Decentralized Sanitation Systems</span>
              </span>
            </div>

            <h1
              className="font-display text-[2.6rem] font-black leading-[1.05] tracking-tight md:text-5xl lg:text-[3.25rem]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
            >
              Advancing Sanitation<br />
              <span className="text-accent">Knowledge</span> for a<br />
              Healthier Zambia
            </h1>

            <p
              className="mt-5 max-w-lg text-[1rem] leading-relaxed text-white/75 md:text-[1.05rem]"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
            >
              The national knowledge platform for sanitation research, policy, training, and
              monitoring — connecting science, policy, and communities across Zambia.
            </p>

            {/* Search bar */}
            <form
              action="/search"
              className="mt-7 flex overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all focus-within:border-white/35 focus-within:bg-white/15"
              suppressHydrationWarning
            >
              <Search className="ml-4 h-5 w-5 shrink-0 self-center text-white/45" />
              <input
                name="q"
                placeholder="Search resources, reports, training materials…"
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="m-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
                suppressHydrationWarning
              >
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                to="/library"
                search={{} as any}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/22"
              >
                <Library className="h-4 w-4" /> Browse Library
              </Link>
              <Link
                to="/training"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/22"
              >
                <GraduationCap className="h-4 w-4" /> Training
              </Link>
              <Link
                to="/sites"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/22"
              >
                <MapPin className="h-4 w-4" /> Demo Sites
              </Link>
            </div>
          </div>

          {/* ── Right: UNZA emblem card ── */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/15 bg-white/8 px-12 py-10 text-center shadow-2xl backdrop-blur-md">
              {/* Logo on white circle so it's always visible regardless of filter */}
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white p-4 shadow-xl ring-4 ring-white/20">
                <img src="/logo.png" alt="University of Zambia" className="h-full w-auto object-contain" />
              </div>
              <div className="h-px w-full bg-white/15" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">University of Zambia</div>
                <div className="mt-1.5 font-display text-xl font-bold leading-tight text-white">Sanitation Hub</div>
                <div className="mt-0.5 text-sm text-white/55">& Laboratory Repository</div>
              </div>
              <div className="h-px w-full bg-white/15" />
              <div className="flex flex-col gap-1 text-[11px] text-white/45">
                <span>Great East Road Campus, Lusaka</span>
                <span>sanitation@unza.zm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container-page">
              <div className="flex flex-wrap divide-x divide-white/10">
                <StatPill value={stats.total_resources} label="Resources" icon={FileText} />
                <StatPill value={stats.demonstration_sites} label="Demo Sites" icon={MapPin} />
                <StatPill value={stats.active_sites} label="Active Sites" icon={BarChart3} />
                <StatPill value={stats.published_events} label="Events" icon={Calendar} />
                <StatPill value={stats.training_materials} label="Training Materials" icon={GraduationCap} />
                <StatPill value={stats.research_outputs} label="Research Outputs" icon={BookOpen} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── What the Hub does ──────────────────────────────────── */}
      <section className="container-page py-20">
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Our work</div>
            <h2 className="font-display text-3xl font-bold">What the Hub does</h2>
          </div>
          <Link to="/about" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Learn more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FlaskConical,
              label: "Research & Innovation",
              desc: "Evidence-based studies on sanitation technologies, sustainability, and public health outcomes.",
              to: "/library",
              search: { type: "research" } as any,
              color: "bg-green-50 text-green-700",
            },
            {
              icon: GraduationCap,
              label: "Capacity Building",
              desc: "Training programmes, workshops, and educational materials for practitioners and students.",
              to: "/training",
              search: undefined,
              color: "bg-blue-50 text-blue-700",
            },
            {
              icon: BarChart3,
              label: "Monitoring & Evaluation",
              desc: "Systematic frameworks and dashboards for tracking sanitation interventions nationwide.",
              to: "/library",
              search: { type: "report" } as any,
              color: "bg-amber-50 text-amber-700",
            },
            {
              icon: MapPin,
              label: "Demonstration Sites",
              desc: "Physical sites showcasing decentralized sanitation technologies across Zambia.",
              to: "/sites",
              search: undefined,
              color: "bg-purple-50 text-purple-700",
            },
          ].map((c) => (
            <Link
              key={c.label}
              to={c.to}
              search={c.search}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-base font-semibold">{c.label}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Explore <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Latest resources ────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Knowledge base</div>
              <h2 className="font-display text-3xl font-bold">Latest resources</h2>
            </div>
            <Link to="/library" search={{} as any} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all resources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {(data?.resources?.length ?? 0) === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-16 text-center">
              <Library className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">No public resources published yet.</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Content will appear here once the admin publishes resources.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(data?.resources ?? []).map((r, i) => (
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
                      <Calendar className="h-3 w-3" />
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
                      Read more <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Upcoming events ─────────────────────────────────────── */}
      <section className="container-page py-20">
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Calendar</div>
            <h2 className="font-display text-3xl font-bold">Upcoming events</h2>
          </div>
          <Link to="/events" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All events <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {(data?.events?.length ?? 0) === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-16 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">No upcoming events scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {(data?.events ?? []).map((e) => (
              <div key={e.id} className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold leading-snug">{e.title}</h3>
                <p className="mt-1.5 text-xs font-medium text-primary">
                  {formatDate(e.start_date)} {e.venue ? `· ${e.venue}` : ""}
                </p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Mission CTA ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-primary py-20 text-primary-foreground">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Open knowledge platform</div>
            <h2 className="font-display text-3xl font-bold leading-tight lg:text-4xl">
              Open to researchers,<br />practitioners, and<br />the public
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-primary-foreground/70">
              UNZA staff and students sign in with their institutional credentials. Members of the public can create a free account to access downloadable resources and training materials.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/library"
                search={{} as any}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-primary shadow-sm hover:bg-white/90 transition-colors"
              >
                <Library className="h-4 w-4" />
                Browse resources
              </Link>
              <Link
                to="/auth"
                search={{ redirect: "/" } as any}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
              >
                <Users className="h-4 w-4" />
                Create free account
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FileText, label: "Policy Documents", desc: "National and institutional policies" },
              { icon: FlaskConical, label: "Research", desc: "Peer-reviewed studies & data" },
              { icon: GraduationCap, label: "Training", desc: "Capacity building materials" },
              { icon: ShieldCheck, label: "Standards", desc: "Guidelines & best practices" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/12 bg-white/6 p-4">
                <item.icon className="h-6 w-6 text-accent mb-3" />
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-0.5 text-xs text-primary-foreground/55">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
