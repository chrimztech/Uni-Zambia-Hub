import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { Calendar, MapPin, User2, Mail, ExternalLink } from "lucide-react";

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
  const { data: ev } = useSuspenseQuery(eventQuery(slug));
  if (!ev) return null;
  return (
    <PublicLayout>
      <article className="container-page max-w-4xl py-12">
        <Link to="/events" className="text-sm text-muted-foreground hover:text-primary">← All events</Link>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{ev.title}</h1>
        <div className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDate(ev.start_date)}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${formatDate(ev.end_date)}` : ""}{ev.start_time ? ` · ${ev.start_time}${ev.end_time ? `–${ev.end_time}` : ""}` : ""}</div>
          {ev.venue && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {ev.venue}</div>}
          {ev.organizer && <div className="flex items-center gap-2"><User2 className="h-4 w-4 text-primary" /> {ev.organizer}</div>}
          {ev.contact_email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${ev.contact_email}`} className="hover:underline">{ev.contact_email}</a></div>}
        </div>
        {ev.description && <div className="prose prose-neutral mt-8 whitespace-pre-wrap text-foreground/90">{ev.description}</div>}
        {ev.registration_link && (
          <a href={ev.registration_link} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <ExternalLink className="h-4 w-4" /> Register / more info
          </a>
        )}
      </article>
    </PublicLayout>
  );
}
