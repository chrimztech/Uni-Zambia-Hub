import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export function BookmarkButton({ contentId }: { contentId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.account.bookmarkStatus(contentId)
      .then((data) => setSaved(data.saved))
      .catch(() => setSaved(false));
  }, [user, contentId]);

  if (!user) {
    return (
      <Link to="/auth" search={{ redirect: "/" } as any} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
        <Bookmark className="h-4 w-4" /> Sign in to save
      </Link>
    );
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (saved) {
        await api.account.removeBookmark(contentId);
        setSaved(false);
        toast.success("Removed from bookmarks");
      } else {
        await api.account.addBookmark(contentId);
        setSaved(true);
        toast.success("Saved to bookmarks");
      }
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={toggle} disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60">
      {saved ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
    </button>
  );
}
