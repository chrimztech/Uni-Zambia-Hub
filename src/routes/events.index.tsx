import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api, toApiUrl } from "@/lib/api";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

const eventsQuery = queryOptions({
  queryKey: ["events", "public"],
  queryFn: async () => api.public.events(),
});

export const Route = createFileRoute("/events/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  head: () => ({
    meta: [
      { title: "Events — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Sanitation workshops, lectures, training and community events from the University of Zambia.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data } = useSuspenseQuery(eventsQuery);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Connect & learn"
        title="Events and workshops"
        description="Join practical training, research conversations and community events advancing sanitation across Zambia."
      />

      <section className="container-page py-12 lg:py-16">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-14 text-center">
            <Calendar className="mx-auto h-10 w-10 text-primary/35" />
            <h2 className="mt-4 font-display text-lg font-bold">No events published</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upcoming events will appear here as soon as dates are confirmed.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {data.map((event) => (
              <Link
                key={event.id}
                to="/events/$slug"
                params={{ slug: event.slug }}
                className="surface-card interactive-card group flex flex-col overflow-hidden p-0"
              >
                {event.banner_image_url && (
                  <div className="h-44 w-full overflow-hidden bg-secondary/40">
                    <img
                      src={toApiUrl(event.banner_image_url)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-primary">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.start_date)}
                    {event.end_date && event.end_date !== event.start_date
                      ? ` – ${formatDate(event.end_date)}`
                      : ""}
                  </span>
                  {event.venue && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {event.venue}
                    </span>
                  )}
                </div>
                <h2 className="mt-5 text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
                  {event.title}
                </h2>
                {event.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                  <span className="text-xs text-muted-foreground">
                    {event.organizer ? `Organised by ${event.organizer}` : "UNZA Sanitation Hub"}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-primary">
                    Event details{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
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
