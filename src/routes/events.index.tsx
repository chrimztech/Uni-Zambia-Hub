import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — UBIRR" },
      { name: "description", content: "University of Zambia events, lectures, workshops, and biosafety initiative activities." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data } = useQuery({
    queryKey: ["events", "public"],
    queryFn: async () => api.public.events(),
  });
  return (
    <PublicLayout>
      <section className="container-page py-12">
        <h1 className="font-display text-4xl font-bold">University Events</h1>
        <p className="mt-2 text-muted-foreground">Published University and project events.</p>
        <div className="mt-8 space-y-4">
          {(!data || data.length === 0) ? (
            <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">No events have been published yet.</p>
          ) : data.map((e) => (
            <Link key={e.id} to="/events/$slug" params={{ slug: e.slug }} className="block rounded-lg border border-border bg-card p-6 transition hover:border-primary">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-primary"><Calendar className="h-4 w-4" /> {formatDate(e.start_date)}{e.end_date && e.end_date !== e.start_date ? ` – ${formatDate(e.end_date)}` : ""}</span>
                {e.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {e.venue}</span>}
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold">{e.title}</h2>
              {e.description && <p className="mt-2 line-clamp-3 text-foreground/85">{e.description}</p>}
              {e.organizer && <p className="mt-2 text-xs text-muted-foreground">Organised by {e.organizer}</p>}
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
