import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { api, toApiUrl } from "@/lib/api";
import { PageHero, PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { ImageIcon } from "lucide-react";

const galleryQuery = queryOptions({
  queryKey: ["gallery", "public"],
  queryFn: async () =>
    (await api.public.gallery()).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      thumbnail_path: item.thumbnail_url,
      published_at: item.published_at,
    })) as Item[],
});

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({
    meta: [
      { title: "Image Gallery — UNZA Sanitation Hub" },
      {
        name: "description",
        content:
          "Photographs from University of Zambia sanitation research, training and demonstration sites.",
      },
    ],
  }),
  component: GalleryPage,
});

type Item = {
  id: string;
  title: string;
  slug: string;
  thumbnail_path: string | null;
  published_at: string | null;
};

function Thumb({ item }: { item: Item }) {
  const url = item.thumbnail_path ? toApiUrl(item.thumbnail_path) : null;
  return (
    <Link
      to="/resource/$slug"
      params={{ slug: item.slug }}
      className="surface-card interactive-card group block overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {url ? (
          <img
            src={url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-primary/30">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.published_at)}</p>
      </div>
    </Link>
  );
}

function GalleryPage() {
  const { data } = useSuspenseQuery(galleryQuery);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="In the field"
        title="Image gallery"
        description="Explore sanitation research, training and demonstration work through photographs from the Hub and its partners."
      />
      <section className="container-page py-12 lg:py-16">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/25 p-14 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-primary/35" />
            <h2 className="mt-4 font-display text-lg font-bold">No images published</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Field and programme photographs will appear here when available.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item) => (
              <Thumb key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
