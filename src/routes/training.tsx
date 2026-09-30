import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, toApiUrl, type TrainingSessionListing, type TrainingSessionPublic } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { formatDate, accessLabel, contentTypeLabel } from "@/lib/format";
import { GraduationCap, Calendar, MapPin, Users, Clock, CheckCircle2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training Programmes — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Access sanitation training materials, manuals, and educational resources from the UNZA Sanitation Hub.",
      },
    ],
  }),
  component: TrainingPage,
});

const TRAINING_TYPES = ["training_material", "manual", "presentation", "guidelines", "standards"];

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

function SessionCard({
  session,
  registered,
  onRegister,
  onCancel,
  registering,
}: {
  session: TrainingSessionListing;
  registered?: boolean;
  onRegister?: () => void;
  onCancel?: () => void;
  registering?: boolean;
}) {
  const { user } = useAuth();
  const nav = useNavigate();
  const isCompleted = session.status === "completed";
  const isFull =
    !isCompleted && session.capacity != null && session.registration_count >= session.capacity;

  return (
    <div
      className={`surface-card flex flex-col overflow-hidden p-0 transition ${isCompleted ? "opacity-75" : "hover:border-primary/30 hover:shadow-lg"}`}
    >
      {session.image_url && (
        <div className="h-36 w-full overflow-hidden bg-secondary/40">
          <img src={toApiUrl(session.image_url)} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center gap-2 text-xs">
        {session.mode && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary capitalize">
            {session.mode}
          </span>
        )}
        {isCompleted && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
            Completed
          </span>
        )}
        {!isCompleted && isFull && !registered && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
            Fully booked
          </span>
        )}
        {registered && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 font-medium text-success-soft-foreground">
            <CheckCircle2 className="h-3 w-3" /> Registered
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold">{session.title}</h3>
      {session.description && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {session.description}
        </p>
      )}

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {formatDate(session.start_date)}
            {session.end_date && session.end_date !== session.start_date
              ? ` – ${formatDate(session.end_date)}`
              : ""}
          </span>
        </div>
        {(session.start_time || session.end_time) && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatTime(session.start_time)}
              {session.end_time ? ` – ${formatTime(session.end_time)}` : ""}
            </span>
          </div>
        )}
        {session.venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{session.venue}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>
            {session.registration_count} registered
            {session.capacity ? ` of ${session.capacity}` : ""}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {isCompleted ? (
          <span className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Registration closed
          </span>
        ) : !user ? (
          <button
            onClick={() => nav({ to: "/auth", search: { redirect: "/training" } })}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
          >
            <LogIn className="h-3.5 w-3.5" /> Sign in to register
          </button>
        ) : registered ? (
          <button
            onClick={onCancel}
            disabled={registering}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-50"
          >
            {registering ? "Cancelling…" : "Cancel registration"}
          </button>
        ) : (
          <button
            onClick={onRegister}
            disabled={registering || isFull}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {registering ? "Registering…" : isFull ? "Fully booked" : "Register"}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

function TrainingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [registering, setRegistering] = useState<string | null>(null);

  const { data: publicSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["public", "training"],
    queryFn: () => api.public.trainingSessions(),
  });

  const { data: userSessions } = useQuery({
    queryKey: ["user", "training"],
    queryFn: () => api.userTraining.sessions(),
    enabled: !!user,
  });

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["training", "materials"],
    queryFn: () => api.public.resources({ q: "", type: "training_material" }),
  });

  const registeredIds = new Set(userSessions?.filter((s) => s.registered).map((s) => s.id) ?? []);

  const handleRegister = async (sessionId: string) => {
    if (!user) return;
    setRegistering(sessionId);
    try {
      await api.userTraining.register(sessionId);
      toast.success("Successfully registered!");
      qc.invalidateQueries({ queryKey: ["user", "training"] });
      qc.invalidateQueries({ queryKey: ["public", "training"] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setRegistering(null);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!window.confirm("Cancel your registration for this session?")) return;
    setRegistering(sessionId);
    try {
      await api.userTraining.cancel(sessionId);
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["user", "training"] });
      qc.invalidateQueries({ queryKey: ["public", "training"] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setRegistering(null);
    }
  };

  const sessions: (TrainingSessionListing & { registered?: boolean })[] = (
    publicSessions ?? []
  ).map((s) => ({
    ...s,
    registered: registeredIds.has(s.id),
  }));

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Build practical skills"
        title="Training programmes"
        description="Register for live sessions and access practical sanitation learning materials for practitioners, students and community teams."
      />

      <div className="container-page space-y-16 py-12 lg:py-16">
        {/* ── Upcoming training sessions ── */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="section-kicker">Live learning</p>
              <h2 className="font-display text-2xl font-bold">Upcoming sessions</h2>
            </div>
            {!user && (
              <Link
                to="/auth"
                search={{ redirect: "/training" }}
                className="text-sm text-primary hover:underline"
              >
                Sign in to register →
              </Link>
            )}
          </div>
          {loadingSessions ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-12 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">
                No upcoming training sessions have been scheduled yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon or browse our resource library below.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  registered={s.registered}
                  onRegister={() => handleRegister(s.id)}
                  onCancel={() => handleCancel(s.id)}
                  registering={registering === s.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Training materials library ── */}
        <section>
          <p className="section-kicker">Resource collection</p>
          <h2 className="mb-2 font-display text-2xl font-bold">Training materials</h2>
          <p className="mb-5 text-sm text-muted-foreground">Browse by resource type:</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {TRAINING_TYPES.map((t) => (
              <Link
                key={t}
                to="/library"
                search={{ type: t, q: "", category: "", department: "" }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                {contentTypeLabel[t] ?? t}
              </Link>
            ))}
          </div>
          {loadingResources ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (resources?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-12 text-center">
              <p className="text-muted-foreground">
                No training materials have been published yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check the{" "}
                <Link
                  to="/library"
                  search={{ q: "", type: "all", category: "", department: "" }}
                  className="text-primary hover:underline"
                >
                  resource library
                </Link>{" "}
                for all available content.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resources!.map((r) => (
                <Link
                  key={r.id}
                  to="/resource/$slug"
                  params={{ slug: r.slug }}
                  className="surface-card interactive-card group flex flex-col p-6"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {contentTypeLabel[r.content_type] ?? r.content_type}
                    </span>
                    <span className="text-muted-foreground">{formatDate(r.published_at)}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {r.summary ?? "—"}
                  </p>
                  <span className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">
                    {accessLabel[r.access_level]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
