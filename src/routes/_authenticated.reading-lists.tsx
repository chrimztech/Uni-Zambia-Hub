import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import type { ReadingList } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  BookMarked, ChevronDown, ChevronRight, Globe, Lock, Pencil, Plus,
  Trash2, X, FileText, AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/reading-lists")({
  head: () => ({ meta: [{ title: "Reading lists — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ReadingListsPage,
});

function ReadingListsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ReadingList | null>(null);

  const { data: lists, isLoading } = useQuery({
    queryKey: ["reading-lists", user?.id],
    enabled: !!user,
    queryFn: () => api.account.readingLists(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["reading-lists"] });

  const createMut = useMutation({
    mutationFn: (payload: { name: string; description?: string; is_public: boolean }) =>
      api.account.createReadingList(payload),
    onSuccess: () => {
      toast.success("Reading list created");
      setCreating(false);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't create list"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string; is_public: boolean } }) =>
      api.account.updateReadingList(id, payload),
    onSuccess: () => {
      toast.success("Reading list updated");
      setEditingId(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't update list"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.account.deleteReadingList(id),
    onSuccess: () => {
      toast.success("Reading list deleted");
      setConfirmDelete(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't delete list"),
  });

  const removeItemMut = useMutation({
    mutationFn: (itemId: string) => api.account.removeReadingListItem(itemId),
    onSuccess: () => {
      toast.success("Removed from list");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Couldn't remove item"),
  });

  return (
    <PublicLayout>
      <section className="container-page max-w-4xl py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Reading lists</h1>
            <p className="mt-2 text-muted-foreground">
              Group resources into named collections — for a project, a course, or a literature review.
            </p>
          </div>
          <button
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New list
          </button>
        </div>

        {creating && (
          <CreateListForm
            onCancel={() => setCreating(false)}
            onSubmit={(payload) => createMut.mutate(payload)}
            saving={createMut.isPending}
          />
        )}

        <div className="mt-8 space-y-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
            </div>
          )}

          {!isLoading && (!lists || lists.length === 0) && !creating && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <BookMarked className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No reading lists yet.</p>
              <button
                onClick={() => setCreating(true)}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Create your first list <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {lists?.map((list) =>
            editingId === list.id ? (
              <CreateListForm
                key={list.id}
                initial={list}
                onCancel={() => setEditingId(null)}
                onSubmit={(payload) => updateMut.mutate({ id: list.id, payload })}
                saving={updateMut.isPending}
              />
            ) : (
              <div key={list.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === list.id ? null : list.id)}
                  className="flex w-full items-start gap-3 p-5 text-left hover:bg-secondary/30 transition-colors"
                >
                  {expanded === list.id ? (
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold">{list.name}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {list.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {list.is_public ? "Public" : "Private"}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {list.items.length} {list.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    {list.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{list.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(list.updated_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingId(list.id)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Rename list"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(list)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </button>

                {expanded === list.id && (
                  <div className="border-t border-border">
                    {list.items.length === 0 ? (
                      <p className="p-5 text-sm text-muted-foreground">
                        No resources in this list yet. Open a resource and use "Add to list" to save it here.
                      </p>
                    ) : (
                      <div className="divide-y divide-border">
                        {list.items.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-secondary/20 transition-colors group">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                to="/resource/$slug"
                                params={{ slug: item.slug }}
                                className="font-medium leading-snug hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.title}
                              </Link>
                              {item.note && (
                                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">Added {formatDate(item.added_at)}</p>
                            </div>
                            <button
                              onClick={() => removeItemMut.mutate(item.id)}
                              className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/8 transition-all"
                              aria-label="Remove from list"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <h3 className="font-semibold">Delete "{confirmDelete.name}"?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This removes the list and its {confirmDelete.items.length} saved{" "}
                  {confirmDelete.items.length === 1 ? "item" : "items"}. The resources themselves aren't affected.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(confirmDelete.id)}
                disabled={deleteMut.isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

function CreateListForm({
  initial,
  onCancel,
  onSubmit,
  saving,
}: {
  initial?: ReadingList;
  onCancel: () => void;
  onSubmit: (payload: { name: string; description?: string; is_public: boolean }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), description: description.trim() || undefined, is_public: isPublic });
      }}
      className="mt-4 space-y-3 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <label className="block text-sm font-medium">List name</label>
        <input
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Thesis literature review"
          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-border" />
        Make this list public (others with the link can view it)
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create list"}
        </button>
      </div>
    </form>
  );
}
