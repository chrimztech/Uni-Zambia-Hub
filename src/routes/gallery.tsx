import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, toApiUrl } from "@/lib/api";
import { PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { ImageIcon } from "lucide-react";
export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Image Gallery — UBIRR" },
      { name: "description", content: "Photographs and image resources from the University of Zambia biosafety initiative." },
    ],
  }),
  component: GalleryPage,
});

type Item = { id: string; title: string; slug: string; thumbnail_path: string | null; published_at: string | null };

function Thumb({ item }: { item: Item }) {
  const url = item.thumbnail_path ? toApiUrl(item.thumbnail_path) : null;
  return (
    <Link
      to="/resource/$slug"
      params={{ slug: item.slug }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary hover:shadow"
    >
      <div className="relative aspect-square bg-secondary">
        {url ? (
          <img src={url} alt={item.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-10 w-10" /></div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{item.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.published_at)}</p>
      </div>
    </Link>
  );
}

function GalleryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["gallery", "public"],
    queryFn: async () => (await api.public.gallery()).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      thumbnail_path: item.thumbnail_url,
      published_at: item.published_at,
    })) as Item[],
  });

  return (
    <PublicLayout>
      <section className="container-page py-12">
        <h1 className="font-display text-4xl font-bold">Image Gallery</h1>
        <p className="mt-2 text-muted-foreground">Photographs and visual resources from the University and the biosafety initiative.</p>
        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No public images have been published yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((i) => <Thumb key={i.id} item={i} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
