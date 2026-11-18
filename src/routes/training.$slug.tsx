import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { api, toApiUrl, type RegistrationStatus } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { ClickToEnlargeImage } from "@/components/image-lightbox";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  User2,
  Mail,
  Clock,
  Users,
  LogIn,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

function formatTime(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

const sessionQuery = (slug: string) => queryOptions({
  queryKey: ["training-session", slug],
  queryFn: async () => api.public.trainingSession(slug),
});

export const Route = createFileRoute("/training/$slug")({
  loader: async ({ context, params }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery(params.slug));
    if (!session) throw notFound();
    return session;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Training"} — UBIRR` },
      { name: "description", content: loaderData?.description?.slice(0, 160) ?? "" },
      { property: "og:title", content: loaderData?.title },
      { property: "og:description", content: loaderData?.description?.slice(0, 160) ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <PublicLayout><div className="container-page py-20 text-center"><h1 className="font-display text-3xl">Training session not found</h1><Link to="/training" className="mt-4 inline-block text-primary">Back to training</Link></div></PublicLayout>
  ),
  component: TrainingDetail,
});

function TrainingDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [registering, setRegistering] = useState(false);
  const { data: session } = useSuspenseQuery(sessionQuery(slug));

  const { data: userSessions } = useQuery({
    queryKey: ["user", "training"],
    queryFn: () => api.userTraining.sessions(),
    enabled: !!user,
  });

  if (!session) return null;
  const userSession = userSessions?.find((s) => s.id === session.id);
  const status: RegistrationStatus | null = userSession?.registration_status ?? null;
  const hasActiveRequest = status === "pending" || status === "approved";
  const isCompleted = session.status === "completed";
  const isFull = !isCompleted && session.capacity != null && session.registration_count >= session.capacity;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.userTraining.register(session.id);
      toast.success("Registration submitted — pending review");
      qc.invalidateQueries({ queryKey: ["user", "training"] });
      qc.invalidateQueries({ queryKey: ["training-session", slug] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your registration for this session?")) return;
    setRegistering(true);
    try {
      await api.userTraining.cancel(session.id);
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["user", "training"] });
      qc.invalidateQueries({ queryKey: ["training-session", slug] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <PublicLayout>
      <article className="container-page max-w-4xl py-12">
        <Link to="/training" className="text-sm text-muted-foreground hover:text-primary">← All training</Link>
        {session.image_url && (
          <div className="mt-4 max-h-[70vh] w-full overflow-hidden rounded-2xl border border-border bg-secondary/40">
            <ClickToEnlargeImage
              src={toApiUrl(session.image_url)}
              alt={session.title}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
        )}
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{session.title}</h1>
        <div className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDate(session.start_date)}
            {session.end_date && session.end_date !== session.start_date ? ` – ${formatDate(session.end_date)}` : ""}
          </div>
          {(session.start_time || session.end_time) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {formatTime(session.start_time)}
              {session.end_time ? ` – ${formatTime(session.end_time)}` : ""}
            </div>
          )}
          {session.venue && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {session.venue}</div>}
          {session.instructor && <div className="flex items-center gap-2"><User2 className="h-4 w-4 text-primary" /> {session.instructor}</div>}
          {session.contact_email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${session.contact_email}`} className="hover:underline">{session.contact_email}</a></div>}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {session.registration_count} registered{session.capacity ? ` of ${session.capacity}` : ""}
          </div>
        </div>

        {session.description && <div className="prose prose-neutral mt-8 whitespace-pre-wrap text-foreground/90">{session.description}</div>}

        {session.requirements && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/20 p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Requirements</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{session.requirements}</p>
          </div>
        )}

        {isCompleted ? (
          <div className="mt-8">
            <span className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
              Registration closed — this session has ended
            </span>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!user ? (
              <Link
                to="/auth"
                search={{ redirect: `/training/${slug}` }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <LogIn className="h-4 w-4" /> Sign in to register
              </Link>
            ) : status === "attended" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" /> Attended
              </span>
            ) : hasActiveRequest ? (
              <>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${status === "approved" ? "bg-success-soft text-success-soft-foreground" : "bg-amber-100 text-amber-700"}`}>
                  {status === "approved" ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  {status === "approved" ? "You're confirmed" : "Pending approval"}
                </span>
                <button
                  onClick={handleCancel}
                  disabled={registering}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                >
                  {registering ? "Cancelling…" : status === "pending" ? "Cancel request" : "Cancel registration"}
                </button>
              </>
            ) : (
              <>
                {status === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive">
                    <XCircle className="h-4 w-4" /> Not approved
                  </span>
                )}
                <button
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {registering ? "Registering…" : isFull ? "Fully booked" : status === "rejected" ? "Register again" : "Register"}
                </button>
              </>
            )}
          </div>
        )}
      </article>
    </PublicLayout>
  );
}
