import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { StarRatingDisplay } from "@/components/star-rating";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => api.admin.reviews(),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((r) =>
      r.resource_title.toLowerCase().includes(q) ||
      r.user_name.toLowerCase().includes(q) ||
      r.user_email.toLowerCase().includes(q) ||
      (r.body ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      await api.admin.deleteReview(id);
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete review");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">Moderate ratings and written reviews submitted by users.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resource, user, or text…"
            className="h-9 w-64 rounded-full border border-border bg-secondary/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/30">
                <td className="max-w-xs truncate px-4 py-3 font-medium">{r.resource_title}</td>
                <td className="px-4 py-3">
                  <div className="text-xs font-medium">{r.user_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.user_email}</div>
                </td>
                <td className="px-4 py-3"><StarRatingDisplay rating={r.rating} /></td>
                <td className="max-w-sm px-4 py-3 text-sm text-muted-foreground">
                  <span className="line-clamp-2">{r.body || "—"}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No reviews{search ? " matching your search" : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
      </div>
    </div>
  );
}
