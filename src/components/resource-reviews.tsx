import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageSquare, Pencil, Trash2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import { StarRatingDisplay, StarRatingInput } from "@/components/star-rating";

export function ResourceReviews({
  contentId,
  slug,
  averageRating,
  reviewCount,
}: {
  contentId: string;
  slug: string;
  averageRating: number;
  reviewCount: number;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftBody, setDraftBody] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["reviews", contentId],
    queryFn: () => api.public.reviews(contentId),
  });

  const ownReview = reviews?.find((r) => r.own);
  const otherReviews = reviews?.filter((r) => !r.own) ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews", contentId] });
    qc.invalidateQueries({ queryKey: ["resource", slug] });
  };

  const startEdit = () => {
    setDraftRating(ownReview?.rating ?? 0);
    setDraftBody(ownReview?.body ?? "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraftRating(0);
    setDraftBody("");
  };

  const submit = async () => {
    if (draftRating < 1) return toast.error("Please select a star rating");
    setSaving(true);
    try {
      await api.account.submitReview(contentId, { rating: draftRating, body: draftBody.trim() || undefined });
      toast.success(ownReview ? "Review updated" : "Review submitted");
      cancelEdit();
      invalidate();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.account.deleteReview(contentId);
      toast.success("Review deleted");
      invalidate();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete review");
    }
  };

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Reviews
        </h2>
        <StarRatingDisplay rating={averageRating} count={reviewCount} size="md" />
      </div>

      {/* Own review / write a review */}
      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        {!user ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Sign in to rate and review this resource.</p>
            <Link
              to="/auth"
              search={{ redirect: `/resource/${slug}` } as any}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/12"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          </div>
        ) : editing ? (
          <div className="space-y-3">
            <StarRatingInput value={draftRating} onChange={setDraftRating} disabled={saving} />
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={3}
              placeholder="Share your thoughts about this resource (optional)"
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : ownReview ? "Update review" : "Submit review"}
              </button>
              <button onClick={cancelEdit} className="rounded-md border border-border px-4 py-1.5 text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : ownReview ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StarRatingDisplay rating={ownReview.rating} />
                <span className="text-xs font-medium text-muted-foreground">Your review</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={startEdit} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={remove} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
            {ownReview.body && <p className="mt-2 text-sm text-foreground/85">{ownReview.body}</p>}
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium">Rate this resource</p>
            <StarRatingInput value={draftRating} onChange={(r) => { setDraftRating(r); setEditing(true); }} />
          </div>
        )}
      </div>

      {/* Other reviews */}
      {otherReviews.length > 0 && (
        <div className="mt-6 divide-y divide-border">
          {otherReviews.map((r) => (
            <div key={r.id} className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.user_name || "Anonymous"}</span>
                  <StarRatingDisplay rating={r.rating} />
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
              </div>
              {r.body && <p className="mt-1.5 text-sm text-foreground/85">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
      {reviews && reviews.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">No reviews yet. Be the first to share your thoughts.</p>
      )}
    </section>
  );
}
