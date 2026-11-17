import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { api, toApiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { ClickToEnlargeImage } from "@/components/image-lightbox";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Calendar, MapPin, User2, Mail, ExternalLink, Users, LogIn, CheckCircle2 } from "lucide-react";

const eventQuery = (slug: string) => queryOptions({
  queryKey: ["event", slug],
  queryFn: async () => api.public.event(slug),
});

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ context, params }) => {
    const ev = await context.queryClient.ensureQueryData(eventQuery(params.slug));
    if (!ev) throw notFound();
    return ev;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Event"} — UBIRR` },
      { name: "description", content: loaderData?.description?.slice(0, 160) ?? "" },
      { property: "og:title", content: loaderData?.title },
      { property: "og:description", content: loaderData?.description?.slice(0, 160) ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <PublicLayout><div className="container-page py-20 text-center"><h1 className="font-display text-3xl">Event not found</h1><Link to="/events" className="mt-4 inline-block text-primary">Back to events</Link></div></PublicLayout>
  ),
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [registering, setRegistering] = useState(false);
  const { data: ev } = useSuspenseQuery(eventQuery(slug));

  const { data: userEvents } = useQuery({
    queryKey: ["user", "events"],
    queryFn: () => api.userEvents.events(),
    enabled: !!user,
  });

  if (!ev) return null;
  const userEvent = userEvents?.find((e) => e.id === ev.id);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.userEvents.register(ev.id);
      toast.success("Successfully registered!");
      qc.invalidateQueries({ queryKey: ["user", "events"] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your registration for this event?")) return;
    setRegistering(true);
    try {
      await api.userEvents.cancel(ev.id);
      toast.success("Registration cancelled");
      qc.invalidateQueries({ queryKey: ["user", "events"] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <PublicLayout>
      <article className="container-page max-w-4xl py-12">
        <Link to="/events" className="text-sm text-muted-foreground hover:text-primary">← All events</Link>
        {ev.banner_image_url && (
          <div className="mt-4 h-64 w-full overflow-hidden rounded-2xl border border-border bg-secondary/40 sm:h-80">
            <ClickToEnlargeImage
              src={toApiUrl(ev.banner_image_url)}
              alt={ev.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{ev.title}</h1>
        <div className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDate(ev.start_date)}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${formatDate(ev.end_date)}` : ""}{ev.start_time ? ` · ${ev.start_time}${ev.end_time ? `–${ev.end_time}` : ""}` : ""}</div>
          {ev.venue && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {ev.venue}</div>}
          {ev.organizer && <div className="flex items-center gap-2"><User2 className="h-4 w-4 text-primary" /> {ev.organizer}</div>}
          {ev.contact_email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${ev.contact_email}`} className="hover:underline">{ev.contact_email}</a></div>}
        </div>
        {ev.description && <div className="prose prose-neutral mt-8 whitespace-pre-wrap text-foreground/90">{ev.description}</div>}
        {ev.registration_link ? (
          <a href={ev.registration_link} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <ExternalLink className="h-4 w-4" /> Register / more info
          </a>
        ) : ev.status === "published" ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!user ? (
              <Link
                to="/auth"
                search={{ redirect: `/events/${slug}` }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <LogIn className="h-4 w-4" /> Sign in to register
              </Link>
            ) : userEvent?.registered ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success-soft-foreground">
                  <CheckCircle2 className="h-4 w-4" /> You're registered
                </span>
                <button
                  onClick={handleCancel}
                  disabled={registering}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
                >
                  {registering ? "Cancelling…" : "Cancel registration"}
                </button>
              </>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {registering ? "Registering…" : "Register"}
              </button>
            )}
            {userEvent && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {userEvent.registration_count} registered
              </span>
            )}
          </div>
        ) : null}
      </article>
    </PublicLayout>
  );
}
