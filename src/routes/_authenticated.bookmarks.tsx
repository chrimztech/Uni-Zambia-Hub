import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { formatDate, contentTypeLabel } from "@/lib/format";
import { toast } from "sonner";
import {
  BookmarkCheck, Clock, Trash2, FileText, ChevronRight, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  head: () => ({ meta: [{ title: "My bookmarks — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: bookmarks, isLoading: bLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: () => api.account.bookmarks(),
  });

  const { data: recent, isLoading: rLoading } = useQuery({
    queryKey: ["recent-views", user?.id],
    enabled: !!user,
    queryFn: () => api.account.recentViews(),
  });

  const remove = async (contentId: string) => {
    await api.account.removeBookmark(contentId);
    toast.success("Removed from bookmarks");
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
  };

  return (
    <PublicLayout>
      <section className="container-page max-w-5xl py-12">
        <h1 className="font-display text-3xl font-bold">My library</h1>
        <p className="mt-2 text-muted-foreground">Resources you've saved and recently viewed.</p>

        {/* Bookmarks */}
        <div className="mt-10">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold mb-4">
            <BookmarkCheck className="h-5 w-5 text-primary" /> Saved resources
            {bookmarks && bookmarks.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {bookmarks.length}
              </span>
            )}
          </h2>

          {bLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {!bLoading && bookmarks?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No saved resources yet.</p>
              <Link to="/library" search={{} as any} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Browse the library <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {!bLoading && bookmarks && bookmarks.length > 0 && (
            <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {bookmarks.map((b) => (
                <div key={b.id} className="flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 mt-0.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {b.content?.slug ? (
                      <Link
                        to="/resource/$slug"
                        params={{ slug: b.content.slug }}
                        className="font-semibold leading-snug hover:text-primary transition-colors line-clamp-2"
                      >
                        {b.content.title ?? "Untitled resource"}
                      </Link>
                    ) : (
                      <span className="font-semibold leading-snug line-clamp-2">
                        {b.content?.title ?? "Untitled resource"}
                      </span>
                    )}
                    {b.content?.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {b.content.summary}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {b.content?.content_type && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                          {contentTypeLabel[b.content.content_type] ?? b.content.content_type}
                        </span>
                      )}
                      <span>Saved {formatDate(b.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(b.content?.id ?? b.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/8 transition-all"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently viewed */}
        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold mb-4">
            <Clock className="h-5 w-5 text-primary" /> Recently viewed
          </h2>

          {rLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {!rLoading && recent?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing here yet — resources you visit will appear here.</p>
          )}

          {!rLoading && recent && recent.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {recent.filter(v => v.content?.slug).map((v, i) => (
                <Link
                  key={i}
                  to="/resource/$slug"
                  params={{ slug: v.content!.slug }}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {v.content!.title ?? "Untitled resource"}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {v.content?.content_type && (
                        <span>{contentTypeLabel[v.content.content_type] ?? v.content.content_type}</span>
                      )}
                      {v.content?.content_type && <span>·</span>}
                      <span>{formatDate(v.viewed_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
